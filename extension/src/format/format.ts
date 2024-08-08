export const format = (script: string) => {
    const decrease_top = /^(end|else|from|\)|group)/;
    const increase_bot = /^(begin|declare|\)|if|else|create|select|from)/;
    const decrease_bot = /(;)$/;

    const output: string[] = [];

    const lines = script.split(/\n/g);
    let line: string | undefined = lines.shift();
    let indentLvl = 0;

    while (line !== undefined) {
        const _line = line.toLowerCase();

        if (decrease_top.test(_line)) indentLvl--;

        if (indentLvl > 0 && _line.startsWith('begin')) {
            indentLvl--;
        }

        if (indentLvl < 0) indentLvl = 0;

        line = '    '.repeat(indentLvl) + line.replace(/\s{2,}/g, ' ');

        if (increase_bot.test(_line)) indentLvl++;
        if (decrease_bot.test(_line)) indentLvl--;

        output.push(line);

        line = lines.shift()?.trim();
    }

    return output.join('\n');
};
