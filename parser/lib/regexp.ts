export const word = /[A-Z]|\/|[a-z]|_|\./;
/** Matches uppercast characters, spaces, and forward slashes */
export const uppercase = /[A-Z]|\/| /;

/** Matches lowercase characters and underscores */
export const lowercase = /[a-z]|_/;

/** Matches `+`, `=`, `-` characters */
export const math = /\+|=|-/;

/** Matches `.`, `!`, and `?` */
export const punctuation = /\.|\!|\?|,/;

/** Matches `, ...` */
export const repeatable = /,|\.|\s/;

export const createOneOf =
    /aggregate|conversion|database|domain|function|group|language|operator class|operator|rule|schema|sequence|table|tablespace|trigger|type|user|view/;
