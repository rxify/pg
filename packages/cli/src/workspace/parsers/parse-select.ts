import { ParsedStmt } from '../document.js';
import { PgTokenizer, Token } from '../grammar/pg-tokenizer.js';
import { View } from './parse-view.js';
import { _ } from './util.js';
import { extractStmtByKeyword } from '../grammar/extract-statements.js';
import { $ref } from '../grammar/reg-exp.js';

export declare type Select = View;

export declare interface Column extends ParsedStmt {
    refs?: string[];
}

export declare interface Source extends ParsedStmt {
    ref: string;
}

declare type SelectStmtKeyword =
    | 'WITH'
    | 'SELECT'
    | 'FROM'
    | 'ONLY'
    | 'TABLESAMPLE'
    | 'NATURAL'
    | 'CROSS'
    | 'RIGHT'
    | 'LEFT'
    | 'JOIN'
    | 'WHERE'
    | 'GROUP'
    | 'HAVING'
    | 'WINDOW'
    | 'UNION'
    | 'INTERSECT'
    | 'EXCEPT'
    | 'ORDER'
    | 'LIMIT'
    | 'OFFSET'
    | 'FETCH'
    | 'FOR'
    | 'OF';

const selectStmtKeywords: SelectStmtKeyword[] = [
    'WITH',
    'SELECT',
    'FROM',
    'ONLY',
    'TABLESAMPLE',
    'NATURAL',
    'CROSS',
    'RIGHT',
    'LEFT',
    'JOIN',
    'WHERE',
    'GROUP',
    'HAVING',
    'WINDOW',
    'UNION',
    'INTERSECT',
    'EXCEPT',
    'ORDER',
    'LIMIT',
    'OFFSET',
    'FETCH',
    'FOR',
    'OF'
];

export declare interface Alias {
    alias?: Token;
    ref?: Token;
}

export function parseSelect(doc: string): Select {
    const tokens = new PgTokenizer([...doc]).tokenize().tokens;
    const stmts = extractStmtByKeyword<SelectStmtKeyword>(
        tokens,
        selectStmtKeywords
    );

    const { columnRefs, columnNames } = parseSelectColumns(stmts.SELECT);
    const from = parseFromStmt(stmts.FROM);
    const join = parseJoinStmt(stmts.JOIN);

    const aliases: Alias[] = [from, join].filter(
        (a) => Object.keys(a).length > 0
    );

    return {
        name: 'select',
        columnRefs,
        columnNames,
        aliases
    };

    function parseSelectColumns(SELECT?: Token[]) {
        const columns: Token[][] = [];

        if (!SELECT) return { columnRefs: [], columnNames: [] };
        columns.push([]);

        let colIndex = 0;
        for (let token of SELECT) {
            if (/select/i.test(token.value)) continue;

            if (token.value === ',') {
                colIndex++;
                columns[colIndex] = [];
                continue;
            }

            columns[colIndex].push(token);
        }

        const columnRefs = new Array<Token>();
        const columnRefNames = new Array<string>();
        const columnNames = new Array<Token>();

        for (let column of columns) {
            if (column.length === 1) {
                const token = column[0];

                if ($ref.test(token.value)) {
                    if (!columnRefNames.includes(token.value)) {
                        columnRefNames.push(token.value);
                        columnRefs.push(token);
                    }
                    columnNames.push(token);
                    continue;
                }

                columnRefs.push(token);
            }

            for (let i = 0; i < columns.length; i++) {
                const token = column[i];
                if (!token) continue;

                if (/\b(when|then)\b/i.test(token.value)) {
                    if (!columnRefNames.includes(token.value)) {
                        columnRefNames.push(token.value);
                        columnRefs.push(column[(i += 1)]);
                    }
                    continue;
                }

                if (/\bas\b/i.test(token.value)) {
                    i = i + 1;
                    columnNames.push(column[i]);
                    continue;
                }

                if (/^((\w|_){1,})(?=)\.((\w|_){1,})$/.test(token.value)) {
                    if (!columnRefNames.includes(token.value)) {
                        columnRefNames.push(token.value);
                        columnRefs.push(token);
                    }
                    continue;
                }
            }
        }

        return {
            columnRefs,
            columnNames
        };
    }

    function parseFromStmt(from?: Token[]): Alias {
        if (!from) return {};
        for (let i = 0; i < from.length; i++) {
            const token = from[i];

            if (/from/i.test(token.value)) continue;

            if (/select/i.test(token.value)) {
                // TODO parse sub-stmt
            }

            if ($ref.test(token.value)) {
                const alias = from[i + 2];
                if (!alias) return { ref: token };
                return { alias, ref: token };
            }
        }

        return {};
    }

    function parseJoinStmt(join?: Token[]): Alias {
        if (!join) return {};

        for (let i = 0; i < join.length; i++) {
            const token = join[i];
            if (!token) continue;

            if (/join/i.test(token.value)) continue;

            if ($ref.test(token.value)) {
                if (!join[i + 1]) return {};
                const alias = join[i + 2];
                if (!alias) return { ref: token };

                return {
                    alias,
                    ref: token
                };
            }
        }

        return {};
    }

    // return {
    //     columns: [],
    //     name: 'select',
    //     references: {}
    // };
}
