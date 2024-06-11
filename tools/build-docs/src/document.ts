const tag = (tag: string, content?: string) => {
    return `<${tag}>\n\t${content ?? ''}\n</${tag}>`;
};

/** `<th>content</th> */
export const th = (content: ReadonlyArray<string> | string) =>
    tag('th', content[0] ?? '-');

/** `<td>content</td> */
export const td = (content: ReadonlyArray<string> | string | undefined) =>
    tag(
        'td',
        Array.isArray(content)
            ? content[0]
            : typeof content === 'string'
            ? content
            : '-'
    );

export const tr = (...cells: string[]) => tag('tr', cells.join(''));

export const thead = (...rows: string[]) =>
    tag('thead', rows.map((row) => '\t' + row).join('\n'));

export const tbody = (...rows: string[]) =>
    tag('tbody', rows.map((row) => '\t' + row).join('\n'));

export const table = (thead?: string, tbody?: string) =>
    tag('table', [thead, tbody].filter((t) => t !== undefined).join('\n'));
