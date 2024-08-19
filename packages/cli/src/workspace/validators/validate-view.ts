import { type Stmt } from '../document.js';
import { PgSyntaxError } from '../error.js';
import { $ref } from '../grammar/reg-exp.js';
import { type Table } from '../parsers/parse-table.js';
import { View } from '../parsers/parse-view.js';

export function validateViewStmt(
    stmt: Stmt<View>,
    views: Record<string, Stmt<View>>,
    tables: Record<string, Stmt<Table>>,
    sql: string
) {
    const baseError = new PgSyntaxError('', sql, stmt.position, stmt.path);
    const errors: PgSyntaxError[] = [];

    const { name, referencesByColumn } = stmt.parsed;

    for (let { value: columnName, position, reference } of referencesByColumn) {
        if (!reference) continue;

        const table = tables[reference.value];
        const view = views[reference.value];

        if (!table && !view) {
            errors.push(
                baseError.fork(
                    `${name} references a table ${reference.value} that does not exist.`
                )
            );
            continue;
        }

        if ($ref.test(columnName)) {
            columnName = columnName.split('.')[1];
        }

        if (
            table?.parsed.columns.find((col) => {
                return col.colname === columnName;
            })
        ) {
            continue;
        }

        if (
            view?.parsed.columns.find((c) => {
                return c.value === columnName;
            })
        ) {
            continue;
        }

        // console.log(view?.parsed.columns, columnName);

        errors.push(
            baseError.fork(
                `Column "${columnName}" referenced in ${name} does not exist in ${reference.value}.`,
                position
            )
        );
    }

    return errors;
}
