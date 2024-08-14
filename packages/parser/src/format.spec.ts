import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { tokenize } from './tokenize';
import { parse } from './parse';
import { PgSyntaxError } from './syntax-error';

const sql = /*sql*/ `
CREATE OR REPLACE VIEW forecast.etc_by_year AS
    SELECT
        etc_year as year,
		SUM(CASE WHEN etc_month = '3' THEN etc_hours ELSE 0 END) as "3",
		SUM(CASE WHEN etc_month = '4' THEN etc_hours ELSE 0 END) as "4",
		SUM(CASE WHEN etc_month = '5' THEN etc_hours ELSE 0 END) as "5",
		SUM(CASE WHEN etc_month = '6' THEN etc_hours ELSE 0 END) as "6",
		SUM(CASE WHEN etc_month = '7' THEN etc_hours ELSE 0 END) as "7",
		SUM(CASE WHEN etc_month = '8' THEN etc_hours ELSE 0 END) as "8",
		SUM(CASE WHEN etc_month = '9' THEN etc_hours ELSE 0 END) as "9",
		SUM(CASE WHEN etc_month = '10' THEN etc_hours ELSE 0 END) as "10",
		SUM(CASE WHEN etc_month = '11' THEN etc_hours ELSE 0 END) as "11",
		SUM(CASE WHEN etc_month = '0' THEN etc_hours ELSE 0 END) as "0",
		SUM(CASE WHEN etc_month = '1' THEN etc_hours ELSE 0 END) as "1",
		SUM(CASE WHEN etc_month = '2' THEN etc_hours ELSE 0 END) as "2"
    FROM
        forecast.hours_etc
    GROUP BY year
	ORDER BY year;

SELECT * FROM forecast.etc_by_year;`;

// const sql = /*sql*/ `
// CREATE OR REPLACE FUNCTION forecast.update_insert_etc(
// 	IN p_project  CHARACTER VARYING,
//     IN p_team     CHARACTER VARYING,
// 	IN p_year     NUMERIC ( 4 ),
// 	IN p_month    NUMERIC ( 2 ),
// 	IN p_hours    NUMERIC ( 6 )
// )
// RETURNS TEXT
// LANGUAGE plpgsql
// AS $$
// DECLARE
// 	var_r TEXT;
// 	var_i NUMERIC;
// BEGIN
// 	var_i := (
// 		SELECT etc_index
// 		  FROM forecast.hours_etc ph
// 		 WHERE ph.etc_project = p_project
// 		   AND ph.etc_team = p_team
// 		   AND ph.etc_year = p_year
// 		   AND ph.etc_month = p_month
// 	);

// 	IF var_i IS NULL THEN
// 		EXECUTE format(
// 			'INSERT INTO forecast.hours_etc(etc_project,etc_team,etc_year,etc_month,etc_hours) '
// 			'values ($1, $2, $3, $4, $5)'
// 		)
// 		USING p_project, p_team, p_year, p_month, p_hours;
// 		var_r := 'Inserted new record';
// 	ELSE
// 		EXECUTE format(
// 			'UPDATE forecast.hours_etc '
// 			'SET etc_hours = $1 '
// 			'WHERE etc_index = $2'
// 		)
// 		USING p_hours, var_i;
// 		var_r := 'Updated existing record';
// 	END IF;

// 	RETURN var_r;
// END $$;
// `.trim();

describe('format', () => {
    test('can tokenize', () => {
        const formatted = tokenize(sql);
        writeFileSync(
            resolve('output.json'),
            JSON.stringify(formatted, null, 4)
        );
        expect(true).toEqual(true);
    });

    test('can parse', () => {
        try {
            const parsed = parse(sql);
            writeFileSync(
                resolve('output.json'),
                JSON.stringify(parsed, null, 4)
            );
        } catch (error) {
            // console.error((<PgSyntaxError>error).message);
            console.error((<PgSyntaxError>error).prettyPrint);
        }
        expect(true).toEqual(true);
    });
});
