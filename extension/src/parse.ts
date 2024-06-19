import { ExecDoc, ExecStmt, LensPoint, isTruthy } from './types';
import { Token, tokenize } from './tokenize';

export function parse(sql: string, source: string) {
    const tokens = tokenize(sql, source);

    /**
     * Consumes tokens until `consumeUntil` returns `false`.
     * @param token
     * @param consumeUntil The end condition for token consumption
     * @returns A concatenated string of all tokens consumed
     */
    const consume = (consumeUntil: (char: Token) => boolean) => {
        let token: Token | undefined;
        do {
            token = tokens.shift();
        } while (token && !consumeUntil(token));

        return token;
    };

    const statements: Token[][] = [];

    let stmtIndex = 0;
    let token: Token | undefined;

    do {
        token = tokens.shift();
        statements[stmtIndex] ??= [];

        if (!token) continue;

        if (
            token.type === 'describe' ||
            token.type === 'returns' ||
            token.type === 'import'
        ) {
            statements[stmtIndex].push(token);
        } else if (token.type === '$') {
            let startIndex = token.position - 'create'.length;

            consume((token) => token.type === 'unknown');

            const end = consume((token) => token.value === ';');
            const start = sql.slice(0, startIndex);
            const script = sql.slice(
                startIndex,
                end ? end.position + 1 : undefined
            );

            statements[stmtIndex].push({
                position: startIndex,
                lineNum: start.split(/\n/g).length - 1,
                type: 'unknown',
                value: script
            });

            stmtIndex++;
        } else if (token.type === 'unknown') {
            let startIndex = token.position - 'select'.length;

            const end = consume(
                (token) => token.value.endsWith(';') || token.value === ';'
            );
            const start = sql.slice(0, startIndex);
            const script = sql.slice(
                startIndex,
                end ? end.position + 1 : undefined
            );

            statements[stmtIndex].push({
                position: startIndex,
                lineNum: start.split(/\n/g).length - 1,
                type: 'function',
                value: script
            });

            stmtIndex++;
        }
    } while (token !== undefined);

    return statements
        .map((statement) => {
            if (statement.length === 1) {
                const stmt = statement[0];

                const wholeFileLens: LensPoint<ExecStmt> = {
                    arg: {
                        stmt: stmt.value.trim(),
                        cursors: false
                    },
                    command: 'extension.runSql',
                    startLine: stmt.lineNum,
                    title: 'Run'
                };

                return wholeFileLens;
            }

            const imports: string[] = [];
            let lens: LensPoint<ExecDoc | ExecStmt> | undefined;
            let startLine: number;
            let returnsCursors = false;
            let description: string;

            statement.forEach((stmt) => {
                if (
                    ['describe', 'import', 'returns', 'comment'].includes(
                        stmt.type
                    )
                ) {
                    startLine ??= stmt.lineNum;

                    switch (stmt.type) {
                        case 'describe':
                            description = stmt.value;
                            break;
                        case 'import':
                            imports.push(stmt.value);
                            break;
                        case 'returns':
                            if (stmt.value.includes('cursor'))
                                returnsCursors = true;
                            break;
                    }
                } else {
                    startLine ??= stmt.lineNum;

                    lens = {
                        command: 'extension.runSql',
                        startLine: startLine,
                        title: 'Run',
                        arg: {
                            stmt: stmt.value.trim(),
                            cursors: returnsCursors,
                            description
                        }
                    };
                }
            });

            if (!lens) return;
            return lens;
        })
        .filter(isTruthy);
}
