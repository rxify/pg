import { StmtType, type Stmt } from '../document.js';
import { PgSyntaxError } from '../error.js';
import { type Table } from '../parsers/parse-table.js';

export function validateTableStmt(
    stmt: Stmt<Table>,
    tables: Record<string, Stmt<Table>>,
    sql: string
) {
    const baseError = new PgSyntaxError('', sql, stmt.position, stmt.path);

    const errors: PgSyntaxError[] = [];

    const { constraints, name, columns } = stmt.parsed;

    constraints.forEach((c) => {
        const validLocal = c.local_col
            .map((col) => {
                return validateReferencedLocalColumn(col, c.position);
            })
            .filter(
                (val): val is NonNullable<PgSyntaxError> => val !== undefined
            );

        if (validLocal.length > 0) {
            errors.push(...validLocal);
            return;
        }

        if (c.f_table) {
            const f_table = c.f_table;
            const f_col = c.f_col;

            if (!f_col) {
                errors.push(
                    baseError.fork(
                        `A foreign table was referenced but no foreign column was specified in ${StmtType[stmt.type]} statement "${name}".`,
                        c.position
                    )
                );
                return;
            }

            const validateForeign = validateForeignKey(
                f_table,
                f_col,
                c.position
            );
            if (validateForeign) {
                errors.push(validateForeign);
                return;
            }
        }
    });

    return errors;

    function validateReferencedLocalColumn(
        local_col: string,
        position: number
    ): PgSyntaxError | undefined {
        if (columns.find((local) => local.colname === local_col)) return;
        return baseError.fork(
            `A local column "${local_col}" is referenced in a constraint but is not declared.`,
            position
        );
    }

    function validateForeignKey(
        f_table_nm: string,
        f_col_nm: string,
        position: number
    ) {
        const f_table = tables[f_table_nm];

        if (!f_table) {
            return baseError.fork(
                `Table referenced in ${StmtType[stmt.type]} statement "${name}" has not been declared.`,
                position
            );
        }

        let f_col = f_table.parsed.columns.find(
            (col) => col.colname === f_col_nm
        );

        if (!f_col) {
            return baseError.fork(
                `A foreign column was referenced in ${StmtType[stmt.type]} statement "${name}".`,
                position
            );
        }

        return;
    }
}
