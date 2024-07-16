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

export class Parser {
    private _tokens: Token[];
    private _statements: Statement[] = [];
    private _stmtIndex = 0;
    private _cursor = -1;

    constructor(
        public sql: string,
        public source: string
    ) {
        this._tokens = tokenize(sql, source);
    }

    get token(): Token {
        return this._tokens[this._cursor];
    }

    get next() {
        this._cursor = this._cursor + 1;
        return this._tokens[this._cursor];
    }

    get type() {
        return this.token.type;
    }

    get position() {
        return this.token.position;
    }

    get lineNum() {
        return this.token.lineNum;
    }

    get value() {
        return this.token.value;
    }

    get valLen() {
        return this.token.value.length;
    }

    get statement(): Statement {
        return this._statements[this._stmtIndex];
    }
    set statement(statement: Statement) {
        this._statements[this._stmtIndex] = statement;
    }

    private _error(message: string) {
        new PgSyntaxError(this._cursor, this.sql, this.source, message);
    }

    private _stepBack() {
        if (this._cursor - 1 >= 0) this._cursor = this._cursor - 1;
        return this.token;
    }

    private _consumeWhile(consume: (char: Token) => boolean) {
        let index = 0;
        let lineNum = 0;

        while (consume(this.next)) {
            index = this.position;
            lineNum = this.lineNum;
        }

        this._stepBack();

        return { index, lineNum };
    }

    private _initStatement(type: StatementType) {
        this.statement ??= <Statement>{};
        this.statement.type = type;
        this.statement.start = {
            index: this.position,
            lineNum: this.lineNum
        };
    }

    private _completeStatement(consume: (char: Token) => boolean) {
        const { index, lineNum } = this._consumeWhile(consume);

        this.statement.end = {
            index,
            lineNum
        };
        this.statement.text = this.source.slice(
            this.statement.start.index,
            index + this.valLen
        );

        this._stmtIndex = this._stmtIndex + 1;
    }

    private _expect(type: TokenType, expected?: string) {
        const isType = this.token.type === type;
        const isVal = expected ? _(this.token.value) === _(expected) : true;

        return isType && isVal;
    }

    private _parseComment() {
        this.statement ??= <Statement>{};

        const commentVal = this.token.value;

        if (this.value.includes('@returns')) {
            this.statement.cursors = this.value.includes('cursors');
        } else if (this.value.includes('@describe')) {
            this.statement.description = commentVal;
        } else {
            this.statement.comments ??= [];
            this.statement.comments.push(commentVal);
        }
    }

    private _consumeFunction() {
        this.statement.subType === 'function';
        this._consumeWhile((token) => _(token.value) !== 'end');
        this.next;
        this._completeStatement((token) => token.value !== ';');
    }

    private _parseCreate() {
        this._initStatement('create');
        this.next;

        // CREATE SCHEMA
        if (this._expect('reserved', 'schema')) {
            this.statement.subType = 'schema';
            return this._completeStatement((token) => token.value !== ';');
        }

        // CREATE TABLE
        if (this._expect('reserved', 'table')) {
            this.statement.subType = 'table';
            return this._completeStatement((token) => token.value !== ';');
        }

        // CREATE OR
        if (this._expect('reserved', 'or')) {
            this.statement.subType = 'table';
            this.next;

            // CREATE OR REPLACE
            if (this._expect('reserved', 'replace')) {
                this.next;

                // CREATE OR REPLACE FUNCTION
                if (this._expect('reserved', 'function')) {
                    return this._consumeFunction();
                }

                throw this._error(
                    `Expected "function"; received ${this.value}`
                );
            }

            throw this._error(`Expected "replace"; received ${this.value}`);
        }

        if (this._expect('reserved', 'function')) {
            return this._consumeFunction();
        }

        throw this._error(
            `Expected "function" or "or"; received ${this.value}.`
        );
    }

    parse() {
        while (this.next) {
            if (!this.token) continue;

            if (
                this.type === 'comment' ||
                this.type === 'describe' ||
                this.type === 'returns'
            ) {
                this._parseComment();
                continue;
            }

            if (this._expect('reserved', 'create')) {
                this._parseCreate();
                continue;
            }

            // SELECT
            if (this._expect('reserved', 'select')) {
                this._initStatement('select');
                this._completeStatement((token) => token.value !== ';');
                continue;
            }
        }

        return this._statements;
    }
}

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
