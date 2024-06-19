import { Token, TokenType, tokenize } from './tokenize';
import { PgSyntaxError } from './parser/syntax-error';

export declare type StatementType = 'select' | 'create';
export declare type StatementSubType = 'table' | 'schema' | 'function';
export declare type StatementPosition = {
    lineNum: number;
    index: number;
};
export declare type Statement = {
    text: string;
    type: StatementType;
    subType?: StatementSubType;
    start: StatementPosition;
    end: StatementPosition;
    comments: string[];
    cursors?: boolean;
    description?: string;
};

const _ = (val: string) => val.toLowerCase();

export function parse(sql: string, source: string) {
    const tokens = tokenize(sql, source);
    const statements: Statement[] = [];

    let stmtIndex = 0;
    let cursor = -1;
    let token = tokens[cursor];

    const error = (message: string) =>
        new PgSyntaxError(cursor, sql, source, message);

    const stepForward = () => {
        cursor = cursor + 1;
        token = tokens[cursor];
        return token;
    };

    const stepBack = () => {
        if (cursor - 1 >= 0) cursor = cursor - 1;
        token = tokens[cursor];
        return token;
    };

    const consumeWhile = (consume: (char: Token) => boolean) => {
        let index = 0;
        let lineNum = 0;

        while (consume(stepForward())) {
            index = token.position;
            lineNum = token.lineNum;
        }

        stepBack();

        return { index, lineNum };
    };

    const initStatement = (type: StatementType) => {
        statements[stmtIndex] ??= <Statement>{};
        statements[stmtIndex].type = type;
        statements[stmtIndex].start = {
            index: token.position,
            lineNum: token.lineNum
        };
    };

    const completeStatement = (consume: (char: Token) => boolean) => {
        const { index, lineNum } = consumeWhile(consume);

        statements[stmtIndex].end = {
            index,
            lineNum
        };
        statements[stmtIndex].text = sql.slice(
            statements[stmtIndex].start.index,
            index + tokens[cursor].value.length
        );

        stmtIndex = stmtIndex + 1;
    };

    const expect = (type: TokenType, expected?: string) => {
        const isType = token.type === type;
        const isVal = expected ? _(token.value) === _(expected) : true;

        return isType && isVal;
    };

    while (stepForward()) {
        if (!token) continue;

        // Add comments to the current statement
        if (
            token.type === 'comment' ||
            token.type === 'describe' ||
            token.type === 'returns'
        ) {
            const commentVal = token.value;

            // Init this statement if it hasn't been already
            statements[stmtIndex] ??= <Statement>{};

            if (token.value.includes('@returns')) {
                statements[stmtIndex].cursors = token.value.includes('cursors');
            } else if (token.value.includes('@describe')) {
                statements[stmtIndex].description = commentVal;
            } else {
                statements[stmtIndex].comments ??= [];
                statements[stmtIndex].comments.push(commentVal);
            }
        }

        // CREATE
        if (expect('reserved', 'create')) {
            initStatement('create');
            stepForward();

            // CREATE SCHEMA
            if (expect('reserved', 'schema')) {
                statements[stmtIndex].subType = 'table';
                completeStatement(
                    (token) =>
                        token.type !== 'punctuation' && token.value !== ';'
                );
                continue;
            }

            // CREATE TABLE
            if (expect('reserved', 'table')) {
                completeStatement(
                    (token) =>
                        token.type !== 'punctuation' && token.value !== ';'
                );
                continue;
            }

            const consumeFunction = () => {
                statements[stmtIndex].subType === 'function';
                consumeWhile((token) => _(token.value) !== 'end');
                stepForward();
                completeStatement((token) => token.value !== ';');
            };

            // CREATE OR
            if (expect('reserved', 'or')) {
                stepForward();

                // CREATE OR REPLACE
                if (expect('reserved', 'replace')) {
                    stepForward();

                    // CREATE OR REPLACE FUNCTION
                    if (expect('reserved', 'function')) {
                        consumeFunction();
                        continue;
                    }

                    throw error(`Expected "function"; received ${token.value}`);
                }

                throw error(`Expected "replace"; received ${token.value}`);
            }

            if (expect('reserved', 'function')) {
                consumeFunction();
                continue;
            }

            throw error(
                `Expected "function" or "or"; received ${token.value}.`
            );
        }

        // SELECT
        if (expect('reserved', 'select')) {
            initStatement('select');
            completeStatement((token) => token.value !== ';');
            continue;
        }
    }

    return statements;
}
