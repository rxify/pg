```ts
const stmts = extractStmtsByKeyword<SelectKeyword>(selectStmtKeywords, sql);

const rawCols = stmts.SELECT?.split(/,/g).map((ln) => parseRow(ln));
const rawRefs = parseReferences();

const cols: string[] = [];
const refs: Record<string, Set<string>> = {};

rawCols?.forEach((col) => {
    if (col.refs && col.refs.length > 0) {
        return col.refs.forEach((_ref) => {
            const [name, col] = _ref.split(/\./);
            cols.push(name);
            refs[rawRefs[name]] ??= new Set<string>();
            refs[rawRefs[name]].add(col);
        });
    }

    Object.entries(rawRefs).forEach(([name, colmn]) => {
        if (name === colmn) {
            refs[name] ??= new Set<string>();
            refs[name].add(col.name);
        }
    });
});

const formattedRefs: Record<string, string[]> = {};

Object.entries(refs).forEach(([name, val]) => {
    const arr = Array.from(val).filter((val) => val !== undefined);
    if (arr.length > 0) if (name) formattedRefs[name] = arr;
});

if (Object.keys(formattedRefs).length === 1) {
    const key = Object.keys(formattedRefs)[0];
    cols.forEach((col) => {
        formattedRefs[key].push(col);
    });
    const set = new Set(formattedRefs[key]);
    formattedRefs[key] = Array.from(set);
}

return {
    columns: cols,
    name: 'select',
    references: formattedRefs
};

function parseRow(ln: string): Column {
    ln = ln.trim();
    const tokens = new PgTokenizer([...ln]).tokenize().tokens;
    let name: string | undefined;

    let refs: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === TokenType.REF) {
            refs.push(tokens[i].value);
            continue;
        }

        if (!tokens[i + 1]) continue;

        if (/when|then/i.test(tokens[i].value)) {
            refs.push(tokens[i + 1].value);
            continue;
        }

        if (/as/i.test(tokens[i].value)) {
            name = tokens[i + 1].value;
            continue;
        }

        if (/(\w|_){1,}/.test(ln)) {
            name = tokens[i].value;
            continue;
        }
    }

    if (!name && refs.length === 1) {
        const [ref] = refs;
        if (ref.includes('.')) name = ref.split('.')[1];
        else name = ref;
    }

    if (!name) {
        throw 'Cannot determine column name in view.';
    }

    // if (/^(\w|_){1,}\.(\w|_){1,}\b$/g.test(ln)) {
    //     const name = ln.split(/\./g)[1];
    //     return { name: name.trim(), refs: [ln] };
    // }

    // if ($as.test(ln)) {
    //     const [before, name] = ln.split($as);
    //     const refs = find(before, /(\w|_){1,}\.(\w|_){1,}/g, true);
    //     return { name: name.trim(), refs };
    // }

    return { name, refs };
}

function parseReferences() {
    const fromMap: Record<string, string> = {};

    [...parseFrom(), ...parseJoin()]?.forEach((src) => {
        fromMap[src.name] = src.ref;
    });

    return fromMap;
}

function parseFrom() {
    const from: Source[] = [];

    let { FROM: fromStmt } = stmts;

    if (fromStmt) {
        fromStmt = fromStmt.trim();
        if ($as.test(fromStmt)) return [parseAlias(fromStmt)];
        return [{ name: fromStmt, ref: fromStmt }];
    }

    return from;
}

function parseJoin() {
    const from: Source[] = [];

    let { JOIN: joinStmt, RIGHT, LEFT, NATURAL, CROSS } = stmts;
    joinStmt ??= RIGHT ??= LEFT ??= NATURAL ??= CROSS;

    if (joinStmt) {
        joinStmt = joinStmt.trim();
        joinStmt = joinStmt.slice(0, _(joinStmt).indexOf('on')).trim();
        if ($as.test(joinStmt)) from.push(parseAlias(joinStmt));
    }

    return from;
}

function parseAlias(val: string) {
    const [ref, alias] = val.split($as);
    return {
        ref: ref.trim(),
        name: alias.trim()
    };
}

// export function extractStmtsByKeyword<T extends string>(
//     stmtKeywords: T[],
//     sql: string
// ) {
//     const stmts: Partial<Record<T, string>> = {};

//     stmtKeywords.forEach((keyword, index) => {
//         const $current = new RegExp(`\\b${keyword}\\b`);
//         const $next = new RegExp(
//             `\\b(${stmtKeywords.slice(index + 1).join('|')})\\b`,
//             'i'
//         );
//         const current = find(sql, $current);
//         if (current) {
//             const next = find(sql, $next);
//             if (next) {
//                 const stmt = sql.slice(
//                     sql.indexOf(current) + current.length,
//                     sql.indexOf(next)
//                 );
//                 stmts[keyword] = stmt;
//             }
//         }
//     });

//     return stmts;
// }
```
