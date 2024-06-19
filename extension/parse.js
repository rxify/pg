// @ts-check

/** @typedef { {index: number, lineNum: number, value: string, type: 'comment' | 'select'} } Token */

/** @param {string} raw */
const tokenize = (raw) => {
    /** @type {Token[]} */
    const tokens = [];

    const chars = raw.split(/|/g);

    /**
     * Consumes tokens until `consumeUntil` returns `false`.
     * @param {string | undefined} token
     * @param {(token: string) => boolean} consumeUntil The end condition for token consumption
     * @returns A concatenated string of all tokens consumed
     */
    const consume = (token, consumeUntil) => {
        let concat = '';

        while (token && consumeUntil(token)) {
            concat = concat + token;
            token = chars.shift();
        }

        return concat;
    };

    let lineNum = 0;
    let char;

    do {
        char = chars.shift();

        console.log(char);

        if (!char) continue;

        if (/\n/.test(char)) {
            console.log('newline');
            lineNum = lineNum + 1;
            continue;
        }

        if (char === 'S') {
            tokens.push({
                index: raw.length - chars.length - 1,
                lineNum,
                value: consume(char, (token) => token !== ';'),
                type: 'select'
            });
            continue;
        }

        if (char === '-') {
            const nextChar = chars.shift();
            if (nextChar && nextChar === '-') {
                tokens.push({
                    index: raw.length - chars.length - 2,
                    lineNum,
                    value: consume('--', (token) => {
                        const isNewline = /\n/.test(token);

                        if (isNewline) {
                            lineNum++;
                        }

                        return !isNewline;
                    }),
                    type: 'comment'
                });
            }
            continue;
        }
    } while (char !== undefined);

    return tokens;
};

const sql = `-- @returns cursors
SELECT * FROM report.yearly_summary_report(2024);

SELECT * FROM forecast.diff_etc_plans_by_year(2024, NULL);

SELECT * FROM forecast.pivot_etc_by_year(2022);

SELECT * FROM forecast.diff_pib_etc_by_year(2024);`;

const tokens = tokenize(sql);
let token = tokens.shift();

/** @type {Token[][]} */
const statements = [];

while (token !== undefined) {
    if (token.type === 'comment') {
        /** @type {Token[]} */
        const statement = [token];

        while (token?.type === 'comment') {
            token = tokens.shift();
            if (!token) continue;
            statement.push(token);
        }

        statements.push(statement);
        token = tokens.shift();
        continue;
    }

    if (token.type === 'select') {
        statements.push([token]);
    }

    token = tokens.shift();
}
