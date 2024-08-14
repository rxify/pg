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

    test('Can parse complex sql', () => {
        const sql = `CREATE OR REPLACE FUNCTION forecast.diff_etc_plans_by_year(
	IN p_year NUMERIC ( 4 ),
	IN p_team CHARACTER VARYING DEFAULT NULL
)
RETURNS TABLE (
	year NUMERIC ( 4 ),
	"3"  NUMERIC ( 5 ),
	"4"  NUMERIC ( 5 ),
	"5"  NUMERIC ( 5 ),
	"6"  NUMERIC ( 5 ),
	"7"  NUMERIC ( 5 ),
	"8"  NUMERIC ( 5 ),
	"9"  NUMERIC ( 5 ),
	"10" NUMERIC ( 5 ),
	"11" NUMERIC ( 5 ),
	"0"  NUMERIC ( 5 ),
	"1"  NUMERIC ( 5 ),
	"2"  NUMERIC ( 5 )
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT 
             etc.year,
			 COALESCE(etc."3",  0) - COALESCE(plan."3",  0) as "3",
			 COALESCE(etc."4",  0) - COALESCE(plan."4",  0) as "4",
			 COALESCE(etc."5",  0) - COALESCE(plan."5",  0) as "5",
			 COALESCE(etc."6",  0) - COALESCE(plan."6",  0) as "6",
			 COALESCE(etc."7",  0) - COALESCE(plan."7",  0) as "7",
			 COALESCE(etc."8",  0) - COALESCE(plan."8",  0) as "8",
			 COALESCE(etc."9",  0) - COALESCE(plan."9",  0) as "9",
			 COALESCE(etc."10", 0) - COALESCE(plan."10", 0) as "10",
			 COALESCE(etc."11", 0) - COALESCE(plan."11", 0) as "11",
			 COALESCE(etc."0",  0) - COALESCE(plan."0",  0) as "0",
			 COALESCE(etc."1",  0) - COALESCE(plan."1",  0) as "1",
			 COALESCE(etc."2",  0) - COALESCE(plan."2",  0) as "2"
	    FROM (
			SELECT * FROM forecast.pivot_etc_by_year(p_year)
		) AS etc
		FULL JOIN (
			SELECT * FROM forecast.pivot_plans_by_year(p_year)
		) AS plan
		  ON etc.year = plan.year
	   	  GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13;
END $$;`;
        const tokenized = tokenize(sql, source);
        console.log(tokenized);
        expect(tokenized).toBeTruthy();
    });
});
