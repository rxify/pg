import { PgSyntaxError } from './error.js';
import { parse as _parse } from 'pgsql-parser';

class PgSqlParserError extends Error {
    fileName!: string;
    functionName!: string;
    lineNumber!: number;
    cursorPosition!: number;
    context: any;
}

const isPgSqlParserError = (val: any): val is PgSqlParserError => {
    return val !== undefined && val !== null && 'cursorPosition' in val;
};

export const parse = (sql: string, path: string) => {
    try {
        _parse(sql);
    } catch (e) {
        if (isPgSqlParserError(e)) {
            throw new PgSyntaxError(e.message, path, sql, e.cursorPosition);
        }

        throw e;
    }
};
