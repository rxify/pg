import { parse, Statement } from './parse';

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

const multiCommandSql = `-- @returns cursors
SELECT * FROM report.yearly_summary_report(2024);

SELECT * FROM forecast.diff_etc_plans_by_year(2024, NULL);

SELECT * FROM forecast.pivot_etc_by_year(2024);

SELECT * FROM forecast.diff_pib_etc_by_year(2024);

SELECT * FROM forecast.pivot_plans_by_year(2024);

SELECT * FROM forecast.pivot_pib_by_year(2024);`;

describe('Postgres Parser', () => {
    test('Can parse sql function', () => {
        const parsed = parse(sql, './src/my-sql.sql');
        expect(parsed).toEqual([
            <Statement>{
                type: 'create',
                subType: 'table',
                start: {
                    index: 0,
                    lineNum: 0
                },
                end: {
                    index: expect.any(Number),
                    lineNum: 45
                },
                text: expect.any(String),
                comments: expect.any(Array)
            }
        ]);
    });

    test('Can parse multi-line sql', () => {
        const parsed = parse(multiCommandSql, './src/my-sql.sql');
        expect(parsed[0]).toEqual({
            type: 'select',
            start: expect.any(Object),
            end: expect.any(Object),
            text: 'SELECT * FROM report.yearly_summary_report(2024)',
            cursors: true
        });
    });
});
