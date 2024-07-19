import { PG_KEYWORD } from 'keywords/kwlist.js';

export enum TokenType {
    CLOSE,
    GROUP_OPEN,
    GROUP_CLOSE,
    KEYWORD,
    OPTIONAL,
    OR,
    OTHER,
    REPEATABLE,
    REQUIRED,
    STRING,
    COMMENT,
    PUNCTUATION,
    REF_CHAR,
    REFERENCE_OPEN
}

export type Token = {
    type: TokenType;
    value: string;
    position: number;
    children?: Token[];
    keyword?: PG_KEYWORD;
};

export type Node = {
    type: TokenType;
    value?: string;
    children?: Node[];
};