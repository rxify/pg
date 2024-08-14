import {
    CommandType,
    parseDocument,
    ParsedStmt,
    Stmt,
    StmtType
} from './document.js';
import { Schema } from './parsers/parse-schema.js';
import { Table } from './parsers/parse-table.js';

export declare type Project = {
    commands: Record<
        CommandType,
        {
            [StmtType.TABLE]: Record<string, Stmt<Table>>;
            [StmtType.SCHEMA]: Record<string, Stmt<Schema>>;
            [StmtType.VIEW]: Record<string, Stmt<ParsedStmt>>;
            [StmtType.FUNCTION]: Record<string, Stmt<ParsedStmt>>;
        }
    >;
    sourceMap: {
        [stmtName: string]: string;
    };
};

export function loadProject(projectFiles: string[]) {
    const documents: Project = {
        commands: {
            [CommandType.CREATE]: {
                [StmtType.SCHEMA]: {},
                [StmtType.TABLE]: {},
                [StmtType.FUNCTION]: {},
                [StmtType.VIEW]: {}
            }
        },
        sourceMap: {}
    };

    projectFiles
        .map((f) => {
            const { stmts, source } = parseDocument(f);
            documents.sourceMap[f] = source;
            return stmts;
        })
        .forEach((document) => {
            document.forEach((stmt) => {
                documents.commands[stmt.command][stmt.type][stmt.name] = stmt;
            });
        });

    return documents;
}
