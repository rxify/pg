import { ParsedStmt } from '../document.js';
import { Alias, Column, parseSelect } from './parse-select.js';

export declare interface View extends ParsedStmt {
    aliases: Alias[];
    columns: Column[];
    referencesByColumn: Column[];
}

export function parseView(sql: string, doc: string, path: string): View {
    const _sql = sql.toLowerCase();
    const name = sql
        .slice(_sql.indexOf('view') + 'view'.length, _sql.indexOf(' as'))
        .trim();
    const { aliases, columns, referencesByColumn } = parseSelect(doc, path);
    return { name, aliases, columns, referencesByColumn };
}
