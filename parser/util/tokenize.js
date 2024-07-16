// @ts-check
import { readFileSync } from 'fs';

const file = readFileSync('./gram.y', 'utf-8');

const chars = [...file];
let char;

/**
 * @type {{
 *      type: 'comment' | 'typedef' | 'static',
 *      value: string;
 * }[]}
 */
const tokens = [];

/**
 *
 * @param {string | undefined} char The last character
 * @param {(char: string) => boolean } until
 * @returns
 */
const consume = (char, until) => {
    let word = '';
    while (char && until(char)) {
        word += char;
        char = chars.shift();
    }
    word += char;
    return word;
};

while ((char = chars.shift())) {
    if (!char) continue;

    // if (char === '/') {
    //     let nxt = chars.shift();
    //     if (nxt && nxt === '*') {
    //         const comment = consume(nxt, (char) => char !== '/');
    //         tokens.push({
    //             type: 'comment',
    //             value: comment
    //         });
    //     }
    // }

    if (/\w/.test(char)) {
        const word = consume(char, (char) => char !== ' ');
        const trimmed = word.trim();

        if (trimmed === 'typedef') {
            const typedef = consume(word, (char) => char !== '}');
            const varname = consume('', (char) => char !== ';');
            tokens.push({
                type: 'typedef',
                value: typedef + varname
            });
            continue;
        }

        if (/static/.test(trimmed)) {
            const statc = consume(word, (char) => char !== ';');
            console.log(statc);
            tokens.push({
                type: 'static',
                value: statc
            });
            continue;
        }
    }

    if (char === '%') {
        const word = consume('', (char) => char === '%');
    }
}
