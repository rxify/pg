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
export const sql = (literals: TemplateStringsArray, ...vars: string[]) => {
    const results = literals.raw.map((segment, index) => {
        return segment.trim() + (vars[index] ?? '');
    });

    return results.join('\n');
};
