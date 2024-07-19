export const format = (script: string) => {
    let indentLvl = 0;
    return script
        .split(/\n/g)
        .map((line) => {
            line = line.trim();
            const _line = line.toLowerCase();

            if (
                _line.startsWith(')') ||
                _line.startsWith('end') ||
                _line.startsWith('else')
            ) {
                indentLvl--;
            }

            if (indentLvl > 0 && _line.startsWith('begin')) {
                indentLvl--;
            }

            line = '    '.repeat(indentLvl) + line.replace(/\s{2,}/g, ' ');

            if (
                _line.startsWith('begin') ||
                _line.startsWith('declare') ||
                _line.endsWith('(') ||
                _line.startsWith('if') ||
                _line.startsWith('else')
            ) {
                indentLvl++;
            }

            return line;
        })
        .join('\n');
};
