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
    WORD,

    REF_CHAR,
    REFERENCE_OPEN
}

export type Token = {
    type: TokenType;
    value: string;
    position: number;
    children?: Token[];
    options?: string[];
};

export type Node = {
    type: TokenType;
    value?: string;
    children?: Node[];
};
