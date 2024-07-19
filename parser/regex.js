import chalk from 'chalk';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const regex = readFileSync(resolve('regex.xml'), 'utf-8')
    .split(/\n/g)
    .filter((row) => row.trim().startsWith('<string>(?i'))
    .map((row) => row.substring(row.indexOf('(') + 1, row.lastIndexOf(')') + 1))
    .map((row) => {
        row = row.replace('?i', '');
        const chars = [...row];

        const consume = (next, _while) => {
            let toReturn = '';
            let char = next;
            while (char && _while(char)) {
                toReturn += char;
                char = chars.shift();
            }
            chars.unshift(char);
            return toReturn;
        };

        let indentLevel = 0;
        const tab = () => {
            if (indentLevel < 0) {
                indentLevel = 0;
            }

            return '  '.repeat(indentLevel);
        };
        const tokens = [];
        let char;
        while ((char = chars.shift())) {
            if (/\s|\:/.test(char)) {
                continue;
            }
            if (char === '^') {
                tokens.push(chalk.gray('SOL\n'));
                continue;
            }

            if (char === '+') {
                tokens.push(chalk.yellow(char));
                continue;
            }

            if (/\\/.test(char)) {
                let next = chars.shift();

                let tag = char + next;

                if (tag === '\\s') {
                    tokens.push(chalk.gray('SPACE'));
                } else if (tag === '\\b') {
                    tokens.push(chalk.gray('BOUNDARY'));
                }

                continue;
            }

            if (char === '|') {
                tokens.push('\n' + tab() + chalk.gray('OR'));
                continue;
            }

            if (char === '(') {
                indentLevel += 1;
                tokens.push(chalk.gray('(\n'));
                continue;
            }

            if (char === ')') {
                indentLevel--;
                tokens.push('\n' + tab() + chalk.gray(')') + '\n');
                continue;
            }

            if (/\w/.test(char)) {
                let next = consume(char, (char) => /\w/.test(char));
                tokens.push(next.trim());
                continue;
            }
            tokens.push(char);
        }
        return tokens.join(' ');
    })
    .join('\n\n');

console.log(regex);
