import { isTruthy } from '../utility/is-truthy';

export enum TokenType {
    KEYWORD,
    PUNCT,
    WORD,
    STRING,
    COL_NAME,
    GROUP_OPEN,
    GROUP_CLOSE,
    COMMENT,
    OPERATOR,
    UNKNOWN
}

export type Token = {
    type: TokenType;
    position: number;
    value: string;
};

/** Safely assert that `val` is a Token. */
export const isToken = (val: any): val is Token => {
    return (
        isTruthy(val) &&
        typeof val === 'object' &&
        'type' in val &&
        'position' in val &&
        'value' in val
    );
};

export declare type Stmt = {
    type: TokenType;
    value: string;
    position: number;
    children?: Stmt[];
};
