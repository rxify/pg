import { ParsedStmt } from '../document.js';
import { PgTokenizer } from '../grammar/pg-tokenizer.js';
// import { find, slice } from '../slice.js';

export declare interface SelectCol {
    reference: {
        table?: string;
        column: string;
    }[];
    alias?: string;
}

export declare interface Select extends ParsedStmt {
    columns: SelectCol[] | '*';
}

// @ts-ignore
export function parseSelect(sql: string, doc: string): Select {
    // const _sql = sql.toLowerCase();

    const select: Select = {
        name: 'select',
        columns: []
    };

    const parser = new PgTokenizer([...sql]);
    console.log(parser.tokens);
    throw new Error();
    // let selectStmt = sql.slice(_sql.indexOf('select'));

    // const columns = slice(selectStmt, 'select', 'from', {})
    //     .split(/,/g)
    //     .map((row): SelectCol => {
    //         row = row.trim();
    //         let alias: string | undefined;

    //         if (/as/i.test(row)) {
    //             alias = find(row, /as\s("?)(\w|\d){1,}("?)/i)
    //                 ?.split(/\s/g)
    //                 .pop();
    //         }

    //         if (row.includes('.')) {
    //             const reference = find(
    //                 row,
    //                 /\w{1,}\.("?)(\w|\d){1,}("?)/g,
    //                 true
    //             )?.map((str) => {
    //                 const [table, column] = str.split('.');
    //                 return { table, column };
    //             });

    //             return {
    //                 reference,
    //                 alias
    //             };
    //         }
    //     });

    // console.log(columns);

    return select;
}
