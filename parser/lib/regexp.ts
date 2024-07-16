export const word = /[A-Z]|\/|[a-z]|_|\./;
/** Matches uppercast characters, spaces, and forward slashes */
export const uppercase = /[A-Z]|\/| /;

/** Matches lowercase characters and underscores */
export const lowercase = /[a-z]|_/;

/** Matches `+`, `=`, `-` characters */
export const math = /\+|=|-/;

/** Matches `, ...` */
export const repeatable = /,|\.|\s/;
