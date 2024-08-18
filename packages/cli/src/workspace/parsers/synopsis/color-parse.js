// @ts-check

import chalk from 'chalk';
import { argv, exit } from 'process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { watch } from 'chokidar';

main();

function main() {
    const path = argv.slice(2).shift();
    if (!path) {
        console.error(chalk.red('You must specify a path'));
        exit();
    }

    watch(resolve(path)).on('all', () => {
        console.clear();
        try {
            console.log(colorize(path));
        } catch (e) {
            handleError(e, path);
        }
    });

    try {
        console.log(colorize(path));
    } catch (e) {
        handleError(e, path);
    }
}

/**
 * @param {{ error: {msg: string, posn: number}, raw: string }} err
 * @param {string} path
 */
function handleError(err, path) {
    const { raw, error } = err;
    const { msg, posn } = error;

    let pre = raw.substring(0, posn);
    const post = raw.substring(posn);

    const preLn = pre.substring(pre.lastIndexOf('\n') + 1);
    const pstLn = post.substring(0, post.indexOf('\n'));

    const line = pre.split(/\n/g).length;
    const preCaret = preLn.replace(
        preLn.trim(),
        ' '.repeat(preLn.trim().length)
    );

    pre = pre.substring(0, pre.lastIndexOf('\n')) + preLn + pstLn + '\n';

    const message = [
        chalk.blue(resolve(path)),
        ':',
        chalk.yellow(line),
        ':',
        chalk.yellow(preCaret.length),
        ' - ',
        chalk.red('error'),
        ': ',
        msg
    ].join('');

    // const errorRef = [
    //     pre,
    //     preCaret + chalk.red('^'),
    //     post.substring(post.indexOf('\n') + 1)
    // ];

    console.error(message);
}

/**
 * @typedef {{
 *    value: string,
 *    isRef?: boolean,
 *    isTag: boolean,
 *    tagType?: 'OPEN' | 'CLOSE',
 *    children?: Token[],
 *    position: number;
 * }} Token
 **/

/** @param {string} path */
function colorize(path) {
    const raw = readFileSync(resolve(path), 'utf-8');

    try {
        const tokens = tokenize(raw);
        const grouped = group(tokens);
        return format(grouped);
    } catch (e) {
        throw {
            error: e,
            raw
        };
    }
}

/** @param {string} raw */
function tokenize(raw) {
    /** @type { Token[] } */
    const tokens = [];
    /** @type { string[] } */
    const chars = [...raw];
    /** @type { string | undefined } */
    let char;

    while ((char = chars.shift())) {
        parseChar(char);
    }

    return tokens;

    /** @param {string} char */
    function parseChar(char) {
        if (/[a-z]/i.test(char)) return tokens.push(consumeWord());
        if (/</.test(char)) return tokens.push(consumeTag());
        if (/:/.test(char)) {
            let nxt = next();
            if (nxt !== ':') return chars.unshift(nxt);
            return tokens.push(consumeRef());
        }
        return tokens.push({
            isTag: false,
            value: char,
            position: raw.length - chars.length
        });
    }

    /** @returns {Token} */
    function consumeWord() {
        let posn = position();
        if (!char) {
            throw {
                msg: 'Unexpected end of input',
                posn
            };
        }
        let word = char;

        while (char.length > 0) {
            char = next();
            if (/[a-z]/i.test(char)) {
                word += char;
                continue;
            }

            chars.unshift(char);
            return {
                isTag: false,
                value: word,
                position: raw.length - chars.length
            };
        }

        throw {
            msg: 'Unexpected end of input',
            posn
        };
    }

    /** @returns {Token} */
    function consumeTag() {
        let posn = position();
        if (!char) {
            throw {
                msg: 'Unexpected end of input',
                posn
            };
        }

        let tag = char;

        while (chars.length > 0) {
            char = next();
            if (char !== '>') {
                tag += char;
                continue;
            }
            tag += char;
            return {
                value: tag.replace(/<|>/g, ''),
                isTag: true,
                tagType: tag.includes('/') ? 'CLOSE' : 'OPEN',
                position: raw.length - chars.length
            };
        }

        throw {
            msg: 'Failed to terminate tag.',
            posn
        };
    }

    /** @returns {Token} */
    function consumeRef() {
        let posn = position();
        let ref = '::';

        while (chars.length > 0) {
            char = next();
            if (char !== ':') {
                ref += char;
                continue;
            }

            let nxt = next();
            if (nxt === ':') {
                return {
                    isRef: true,
                    isTag: false,
                    value: ref + '::',
                    position: raw.length - chars.length
                };
            }
        }

        throw {
            msg: 'Failed to terminate reference tag ::',
            posn
        };
    }

    /** @param {number} shiftCount */
    function next(shiftCount = 1) {
        while (true) {
            let next = chars.shift();
            if (!next) {
                throw {
                    msg: 'Unexpected end of file.',
                    posn: position()
                };
            }
            shiftCount--;
            if (shiftCount === 0) return next;
        }
    }

    function position() {
        return raw.length - chars.length;
    }
}

/** @param {Token[]} tokens */
function group(tokens) {
    /** @type {Token[]} */
    const grouped = [];

    /** @type {Token | undefined} */
    let token;

    while ((token = tokens.shift())) {
        if (token.isTag) {
            grouped.push(addChildren(token));
            continue;
        }

        grouped.push(token);
    }

    return grouped;

    /** @param {Token} parent */
    function addChildren(parent) {
        /** @type {Token | undefined} */
        let child;

        parent.children ??= [];

        while (tokens.length > 0) {
            child = next();
            if (child.isTag && child.tagType === 'CLOSE') {
                return parent;
            }
            if (child.isTag && child.tagType === 'OPEN') {
                parent.children.push(addChildren(child));
                continue;
            }
            parent.children.push(child);
        }

        throw {
            msg: 'Failed to close ' + parent.value,
            posn: parent.position
        };
    }

    /** @param {number} shiftCount */
    function next(shiftCount = 1) {
        while (true) {
            let next = tokens.shift();
            if (!next)
                throw {
                    msg: 'Unexpected end of input.',
                    posn: token?.position
                };
            shiftCount--;
            if (shiftCount === 0) return next;
        }
    }
}

/** @param {Token[]} grouped */
function format(grouped) {
    let formatted = '';
    /** @type {Token | undefined} */
    let token;

    while ((token = grouped.shift())) {
        if (token.isTag) {
            if (token.tagType === 'OPEN') {
                const colorFn = getColorFn(token.value);
                if (!token.children) throw 'Empty tag detected ' + token.value;
                formatted += colorFn(format(token.children));
                continue;
            }

            if (token.tagType === 'CLOSE') {
                return formatted;
            }
        }

        formatted += token.value;
    }

    return formatted;

    /** @param {string} color */
    function getColorFn(color) {
        // file.shift(); //end-tag
        switch (color) {
            case 'o': // optional
                return chalk.blue;
            case 'r': // required
                return chalk.red;
            case 'v': // variable
                return chalk.green;
            case 'b': //bold
                return chalk.bold;
            case 'i': // italic
                return chalk.italic;
            case 'y':
                return chalk.yellow;
            case 'm':
                return chalk.magenta;
            case 'd':
                return chalk.dim;
            case 'c':
                return chalk.cyan;
            case 'g':
                return chalk.gray;
            default:
                return chalk.white;
        }
    }
}
