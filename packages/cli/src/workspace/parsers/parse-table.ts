import { ParsedStmt } from '../document.js';
import { slice } from '../slice.js';

export declare interface Table extends ParsedStmt {
    columns: TableColumn[];
    constraints: Constraint[];
}

export declare type TableColumn = {
    colname: string;
    type: string;
};

export enum ConstraintType {
    PRIMARY_KEY,
    FOREIGN_KEY,
    UNIQUE
}

export declare type Constraint = {
    type: ConstraintType;
    name: string;
    local_col: string[];
    f_table?: string;
    f_col?: string;
    position: number;
};

export function parseTable(sql: string, doc: string): Table {
    const _sql = sql.toLowerCase();

    const name = parseTableName(sql);

    const split = sql
        .substring(sql.indexOf('(') + 1, sql.lastIndexOf(')'))
        .trim()
        .split(/,/g);

    const constraintIndex = split.findIndex((ln) => /constraint/i.test(ln));

    const columns = split.splice(0, constraintIndex).map((ln) => {
        let [nm, type, type2] = ln.trim().split(/\s/g);
        if (type2 && /character/i.test(type)) {
            type += ' ' + type2;
        }
        return {
            colname: nm.trim(),
            type
        };
    });

    const constraints = sql
        .substring(_sql.indexOf('constraint'), _sql.indexOf(';'))
        .split(/constraint/i)
        .map((c) => {
            const raw = c.trim();
            const constraint = c.trim().replace(/(\s|\t|\n){1,}/g, ' ');

            return { constraint, raw };
        })
        .filter((c) => c.constraint.length > 0)
        .map(({ constraint, raw }) => {
            const $fk = /foreign key/i;
            const $pk = /primary key/i;
            const $uq = /unique/i;

            let name = constraint.substring(0, constraint.indexOf(' '));
            let position = doc.indexOf(raw);

            if ($pk.test(constraint)) {
                return updateConstraintPosn(
                    parsePrimaryKey(name, constraint, position),
                    raw
                );
            }

            if ($fk.test(constraint)) {
                return updateConstraintPosn(
                    parseForeignKey(name, constraint, position),
                    raw
                );
            }

            if ($uq.test(constraint)) {
                return updateConstraintPosn(
                    parsePrimaryKey(
                        name,
                        constraint,
                        position,
                        ConstraintType.UNIQUE
                    ),
                    raw
                );
            }

            throw `Constraint at ${constraint} is not implemented.`;
        });

    return { name, constraints, columns };
}

function parseTableName(sql: string) {
    const declaration = slice(sql, 'table', '(', {
        offsetEnd: -1
    }).trim();

    return declaration.slice(declaration.lastIndexOf(' ')).trim();
}

function parsePrimaryKey(
    name: string,
    constraint: string,
    position: number,
    type: ConstraintType = ConstraintType.PRIMARY_KEY
): Constraint {
    const pk = slice(constraint, '(', ')');

    return {
        name,
        local_col: pk.split(',').map((c) => c.trim()),
        type,
        position
    };
}

function parseForeignKey(
    name: string,
    constraint: string,
    position: number
): Constraint {
    let local_col = slice(constraint, 'foreign key', 'references', {
        offsetStart: 2,
        offsetEnd: -2
    });
    let ref_table = slice(constraint, 'references');
    let ref_column = slice(ref_table, '(', ')');
    ref_table = ref_table.substring(0, ref_table.indexOf(' '));

    return {
        local_col: local_col.split(','),
        name,
        type: ConstraintType.FOREIGN_KEY,
        f_col: ref_column,
        f_table: ref_table,
        position
    };
}

function updateConstraintPosn(constraint: Constraint, raw: string) {
    const local_col = constraint.local_col[0];
    if (local_col)
        constraint.position = constraint.position + raw.indexOf(local_col);
    return constraint;
}
