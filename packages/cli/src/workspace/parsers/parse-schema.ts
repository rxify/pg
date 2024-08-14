import { ParsedStmt } from '../document.js';

export declare interface Schema extends ParsedStmt {}

export function parseSchema(sql: string): Schema {
    const $name = /CREATE SCHEMA( IF NOT EXISTS){0,} ((?!;)[a-z]{1,})/gi;
    try {
        let nameMatch = sql.match($name);
        if (nameMatch) {
            const name = nameMatch[0].slice(nameMatch[0].lastIndexOf(' ') + 1);
            return { name };
        }
    } catch {}

    let name = sql.replace(
        /CREATE SCHEMA( IF NOT EXISTS){0,} (?!;)((?!;)[a-z]{1,})/gi,
        '$2'
    );
    name = name.split(/\s|\n/)[0]?.trim();

    return {
        name
    };
}
