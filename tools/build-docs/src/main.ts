import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createWriteStream, existsSync, readFileSync } from 'fs';
import type { Program, File, ReadmeNode, IndecentType } from './types.js';
import showdown from 'showdown';
import { table, tbody, td, th, thead, tr } from './document.js';

const root = dirname(fileURLToPath(import.meta.url));
const typedocOut = join(root, 'out.json');
const command = `npx typedoc --json ${typedocOut} --pretty`;
execSync('cd ../../;' + command);

if (!existsSync(typedocOut))
    throw new Error('Failed to read out.json as it does not exist.');

/** The parsed JSON output of typedoc. */
const parsed: Program = JSON.parse(readFileSync(typedocOut, 'utf-8'));

const readme = parsed.readme.map((node) => node.text).join('');

const converter = new showdown.Converter();

const readmeHTML = converter.makeHtml(readme);

const processType = (type?: IndecentType) => {
    if (!type) return '';

    const header = thead(
        tr(th`Name`, th`Qualified Name`, th`Type`, th`Package`)
    );
    const body = tbody(
        tr(
            td(type.name ?? '-'),
            td(type.qualifiedName),
            td(type.type),
            td(type.package)
        )
    );

    return table(header, body);
};

const processNode = (file: File) => {
    const heading = `## ` + file.name;
    const summary = file.comment?.summary
        .map((node) => {
            node.text;
        })
        .join(' ');

    const types = processType(file.type);
    const examples: ReadmeNode[] = [];

    file.comment?.blockTags?.forEach((node) => {
        if (node.tag === '@example') {
            examples.push(...node.content);
        }
    });

    return converter.makeHtml(
        heading +
            '\n\n' +
            summary +
            '\n\n' +
            examples.map((value) => value.text).join('') +
            '\n\n' +
            types
    );
};

const out = createWriteStream(join(root, 'readme.html'));

out.write(readmeHTML);
out.write('\n');

parsed.children.forEach((child) => {
    out.write(processNode(child));
});

out.close();
