import { type Stmt } from '../document.js';
import { PgSyntaxError } from '../error.js';
import { type Table } from '../parsers/parse-table.js';
import { View } from '../parsers/parse-view.js';

export function validateViewStmt(
    stmt: Stmt<View>,
    // @ts-ignore
    views: Record<string, Stmt<View>>,
    // @ts-ignore

    tables: Record<string, Stmt<Table>>,
    sql: string
) {
    const baseError = new PgSyntaxError('', sql, stmt.position, stmt.path);
    const errors: PgSyntaxError[] = [];

    const { name, aliases, columnRefs } = stmt.parsed;
    // console.log(
    // JSON.stringify({ name, aliases, columnNames, columnRefs }, null, 4)
    // );

    type LocalRef = {
        reference: string;
        column: string;
        position: number;
    };

    const localRefs = columnRefs
        .map(({ value, position }): LocalRef | null => {
            const [ref, alias] = value.split('.');

            const reference = aliases.find((a) => a.alias?.value === ref);

            if (!reference || !reference.ref) {
                if (aliases.length > 1) {
                    errors.push(
                        baseError.fork(
                            `When referencing multiple tables, you must assign an alias to each table. (${name})`,
                            position
                        )
                    );
                    return null;
                }

                const refTable = aliases[0].ref?.value;

                if (!refTable) {
                    errors.push(
                        baseError.fork(
                            `Failed to locate reference table.`,
                            position
                        )
                    );
                    return null;
                }

                return {
                    reference: refTable,
                    column: value,
                    position
                };
            }

            return {
                reference: reference.ref.value,
                column: alias ?? ref,
                position
            };
        })
        .filter((val): val is LocalRef => {
            return val !== null;
        });

    for (let { column, position, reference } of localRefs) {
        if (!tables[reference] && !views[reference]) {
            errors.push(
                baseError.fork(
                    `${name} references a table ${reference} that does not exist.`
                )
            );
            continue;
        }

        if (
            tables[reference]?.parsed.columns.find((col) => {
                if (col.colname === column) {
                    return true;
                }

                return false;
            })
        ) {
            continue;
        }

        if (
            views[reference]?.parsed.columnNames.find((c) => c.value === column)
        ) {
            continue;
        }

        errors.push(
            baseError.fork(
                `Column "${column}" referenced in ${name} does not exist in ${reference}.`,
                position
            )
        );
    }

    return errors;
}
