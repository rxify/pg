import { ParsedStmt } from '../document.js';
import { Token } from '../grammar/pg-tokenizer.js';
import { Alias, parseSelect } from './parse-select.js';

export declare interface View extends ParsedStmt {
    aliases: Alias[];
    columnNames: Token[];
    columnRefs: Token[];
}

export function parseView(sql: string, doc: string): View {
    const _sql = sql.toLowerCase();
    const name = sql
        .slice(_sql.indexOf('view') + 'view'.length, _sql.indexOf(' as'))
        .trim();
    const { aliases, columnNames, columnRefs } = parseSelect(doc);
    return { name, aliases, columnNames, columnRefs };
}
