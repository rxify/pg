import { $word } from './reg-exp.js';

export declare interface RegExpEntry {
    entry: string;
    $entry: RegExp;
}

export class RegExpArray extends Array<RegExpEntry> {
    constructor(...entries: string[]) {
        super(
            ...entries.map((entry) => {
                return {
                    entry,
                    $entry: $word(entry)
                };
            })
        );
    }
}
