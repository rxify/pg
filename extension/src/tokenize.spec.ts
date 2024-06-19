import { Token, TokenType, tokenize } from './tokenize';

const source = './src/my-script.sql';

describe('Can parse sql', () => {
    test('Can parse one-line script', () => {
        const script = `SELECT * FROM my_schema.myfunction()`;
        const expected: Token[] = [
            {
                position: 0,
                type: 'reserved',
                value: 'SELECT',
                lineNum: 0
            },
            {
                position: 7,
                type: 'all',
                value: '*',
                lineNum: 0
            },
            {
                position: 9,
                type: 'reserved',
                value: 'FROM',
                lineNum: 0
            },
            {
                position: 14,
                type: 'function',
                value: 'my_schema.myfunction',
                lineNum: 0
            },

            {
                position: 34,
                type: 'open',
                value: '(',
                lineNum: 0
            },
            {
                lineNum: 0,
                position: 35,
                type: 'close',
                value: ')'
            }
        ];

        const tokens = tokenize(script, source);
        expect(tokens).toEqual(expected);
    });

    test('Can parse multiple select statements', () => {
        const script = `-- @returns cursors
SELECT * FROM report.yearly_summary_report(2024);

SELECT * FROM forecast.diff_etc_plans_by_year(2024, NULL);`;

        const tokenSegments = <[TokenType, string, number][]>[
            ['returns', '-- @returns cursors', 0],
            ['reserved', 'SELECT', 1],
            ['all', '*', 1],
            ['reserved', 'FROM', 1],
            ['function', 'report.yearly_summary_report', 1],
            ['open', '(', 1],
            ['number', '2024', 1],
            ['close', ')', 1],
            ['punctuation', ';', 1],
            ['reserved', 'SELECT', 3],
            ['all', '*', 3],
            ['reserved', 'FROM', 3],
            ['function', 'forecast.diff_etc_plans_by_year', 3],
            ['open', '(', 3],
            ['number', '2024', 3],
            ['punctuation', ',', 3],
            ['null', 'NULL', 3],
            ['close', ')', 3],
            ['punctuation', ';', 3]
        ];

        const expected = tokenSegments.map((token) => {
            const [type, value, lineNum] = token;

            return <Token>{
                type,
                value,
                lineNum,
                position: expect.any(Number)
            };
        });

        const tokens = tokenize(script, source);

        expect(tokens).toEqual(expected);
    });
});
