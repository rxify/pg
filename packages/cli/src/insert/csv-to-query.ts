import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export function csvToQuery(
    path: string,
    into: string,
    columns?: string[],
    onConflict?: string,
    write?: boolean
) {
    const values: any[] = [];
    let index = 0;

    let records = readFileSync(path, 'utf-8')
        .split(/\n|\r/g)
        .map((row) =>
            row.split(/"/).filter((val) => val.length > 0 && val !== ',')
        )
        .filter((val) => {
            return val.length > 0;
        })
        .map(
            (val) =>
                '\t(' +
                val
                    .map((val) => {
                        index++;
                        values.push(val);
                        return '$' + index;
                    })
                    .join(',') +
                ')'
        )
        .join(',\n');

    let queryStr = 'INSERT INTO ' + into + ' ';

    if (columns) {
        queryStr += '(' + columns.join(',') + ') ';
    }

    queryStr += 'VALUES\n' + records;

    if (onConflict) {
        queryStr += '\n' + onConflict;
    }

    queryStr += ';';

    if (write) {
        writeFileSync(resolve('out.sql'), queryStr);
    }

    return {
        queryStr,
        values
    };
}
