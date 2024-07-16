@define find_existing_etc {
    SELECT etc_index
		  FROM forecast.hours_etc ph
		 WHERE ph.etc_project = p_project
		   AND ph.etc_team = p_team
		   AND ph.etc_year = p_year
		   AND ph.etc_month = p_month
}

@define insert_new_record {
    EXECUTE format(
			'INSERT INTO forecast.hours_etc(etc_project,etc_team,etc_year,etc_month,etc_hours) '
			'values ($1, $2, $3, $4, $5)'
	)
	USING p_project, p_team, p_year, p_month, p_hours;
	var_r := 'Inserted new record';
}

@define update_existing_record {
    EXECUTE format(
			'UPDATE forecast.hours_etc '
			'SET etc_hours = $1 '
			'WHERE etc_index = $2'
	)
	USING p_hours, var_i;
	var_r := 'Updated existing record';
}

CREATE OR REPLACE FUNCTION forecast.update_insert_etc(
	IN p_project  CHARACTER VARYING,
    IN p_team     CHARACTER VARYING,
	IN p_year     NUMERIC ( 4 ),
	IN p_month    NUMERIC ( 2 ),
	IN p_hours    NUMERIC ( 6 )
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
	var_r TEXT;
	var_i NUMERIC;
BEGIN
	var_i := (
		{{ find_existing_etc }}
	);

	IF var_i IS NULL THEN
		{{ insert_new_record }}
	ELSE
		{{ update_existing_record }}
	END IF;
	
	RETURN var_r;
END $$;
