/**
 * Used to take a advantage of the [vscode-sql-template-literal](https://marketplace.visualstudio.com/items?itemName=forbeslindesay.vscode-sql-template-literal)
 * VS Code extension.
 * @param sql An sql string
 * @returns The string trimmed
 */
export const sql = (sql: ReadonlyArray<string>) => {
    return sql[0].trim();
};
