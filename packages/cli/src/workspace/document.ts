import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { exit } from 'process';

import { parseTable } from './parsers/parse-table.js';
import { parseSchema } from './parsers/parse-schema.js';
import { parseSelect } from './parsers/parse-select.js';

export interface ParsedStmt {
    name: string;
}

export enum CommandType {
    CREATE
}

export enum StmtType {
    SCHEMA,
    TABLE,
    VIEW,
    FUNCTION,
    SELECT
}

export declare type Stmt<T extends ParsedStmt = ParsedStmt> = {
    command: CommandType;
    type: StmtType;
    name: string;
    parsed: T;
    stmt: string;
    path: string;
    position: number;
};

export function parseDocument(path: string) {
    if (!path.startsWith('/')) path = resolve(path);
    if (!existsSync(path)) throw `File does not exist at ${path}.`;

    let file = readFileSync(path, 'utf-8');
    let chars = [...file];
    let numChars = chars.length;
    let char: string | undefined;
    let stmts: Stmt[] = [];

    while ((char = chars.shift())) {
        let position = numChars - chars.length;
        if (char === '-') {
            char = chars.shift();
            if (!char) continue;
            if (char !== '-') chars.unshift(char, '-');
            consume('CONSUME_ORPHAN').until((char) => /\n/.test(char));
        }

        if (/C/i.test(char)) {
            let stmt = consume('DISCARD_ORPHAN').until((char) =>
                /\s/.test(char)
            );
            if (/create/i.test(stmt)) {
                stmt = consume('CONSUME_ORPHAN').until(
                    (char) => /;/.test(char),
                    stmt
                );

                const type = getStmtType(stmt);
                const parsed = parse(type, stmt, file);

                stmts.push({
                    name: parsed.name,
                    path,
                    position,
                    stmt,
                    command: CommandType.CREATE,
                    type: getStmtType(stmt),
                    parsed
                });
            }
        }
    }

    return { stmts, source: file };

    type OrphanBehavior =
        | 'CONSUME_ORPHAN'
        | 'UNSHIFT_ORPHAN'
        | 'DISCARD_ORPHAN';

    function consume(orphanBehavior: OrphanBehavior = 'UNSHIFT_ORPHAN') {
        function handleOrphan(word: string) {
            if (char) {
                switch (orphanBehavior) {
                    case 'CONSUME_ORPHAN':
                        word += char;
                        break;
                    case 'UNSHIFT_ORPHAN':
                        chars.unshift(char);
                }
            }

            return word;
        }

        return {
            until: function (
                until: (char: string) => boolean,
                word: string = ''
            ) {
                while (char && !until(char)) {
                    word += char;
                    char = chars.shift();
                }
                return handleOrphan(word);
            },
            while: function (
                whiile: (char: string) => boolean,
                word: string = ''
            ) {
                while (char && whiile(char)) {
                    word += char;
                    char = chars.shift();
                }
                return handleOrphan(word);
            }
        };
    }

    function getStmtType(stmt: string) {
        if (/table/i.test(stmt)) {
            return StmtType.TABLE;
        }
        if (/schema/i.test(stmt)) {
            return StmtType.SCHEMA;
        }
        if (/select/i.test(stmt)) {
            return StmtType.SELECT;
        }

        console.error(chalk.red('Unknown stmt type'));
        console.error(stmt);
        exit();
    }

    function parse(type: StmtType, stmt: string, sql: string): ParsedStmt {
        switch (type) {
            case StmtType.TABLE:
                return parseTable(stmt, sql);
            case StmtType.SCHEMA:
                return parseSchema(stmt);
            case StmtType.SELECT:
                return parseSelect(stmt, sql);
        }
        // @ts-ignore
        throw `Stmt type "${StmtType[type]}" not implemented`;
    }
}
