import { parse as parseAST } from 'pgsql-parser';

export const transverse = (obj: any) => {
    const values: any[] = [];

    if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
            values.push(...obj.flatMap((val) => transverse(val)));
            return values;
        }

        values.push(...Object.values(obj).flatMap((val) => transverse(val)));
        return values;
    }

    values.push(obj);
    return values;
};

export const parse = (sqlString: string) => {
    return parseAST(sqlString);
};

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
export const sql = (literals: TemplateStringsArray, ...vars: any[]) => {
    const results = literals.raw.map((segment, index) => {
        return segment + (vars[index] ?? '');
    });

    // try {
    //     const parseResults = parse(results.join('\n'));

    //     writeFileSync(
    //         resolve('out.yml'),
    //         stringify(parseResults[0]['RawStmt'].stmt, null, 4)
    //     );
    //     writeFileSync(
    //         resolve('out.json'),
    //         JSON.stringify(parseResults[0]['RawStmt'].stmt, null, 4)
    //     );
    // } catch (e) {
    //     console.error('Failed to parse SQL:');
    //     console.error(e);
    // }

    return results.join(' ');
};
