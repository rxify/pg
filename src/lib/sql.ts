/**
 * Used to take a advantage of the [vscode-sql-template-literal](https://marketplace.visualstudio.com/items?itemName=forbeslindesay.vscode-sql-template-literal)
 * VS Code extension that provides syntax highlighting.
 * @param sql An sql string
 * @returns The string, trimmed
 *
 * @example
 *
 * const mySqlString = sql`SELECT * FROM my_table`
 *
 * @publicApi
 */
export const sql = (sql: ReadonlyArray<string>) => {
    return sql[0].trim();
};
