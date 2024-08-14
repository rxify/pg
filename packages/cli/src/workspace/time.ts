import chalk from 'chalk';

export function now() {
    const now = new Date();
    return (
        '[' +
        chalk.gray(
            [
                ((now.getHours() + 11) % 12) + 1,
                now.getMinutes(),
                now.getSeconds()
            ]
                .map((seg) => (seg < 10 ? '0' + seg : seg))
                .join(':')
        ) +
        ']'
    );
}
