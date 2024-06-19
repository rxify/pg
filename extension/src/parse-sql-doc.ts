export const parseSqlDoc = (text: string) => {
    const params: string[] = [];
    let returnsCursors = false;

    text.split(/\n/g)
        .filter((line) => /^--(\s){0,}@/.test(line))
        .forEach((ln) => {
            if (ln.includes('param')) {
                params.push(ln.slice(ln.indexOf('param')).trim());
            } else if (ln.includes('returns')) {
                if (ln.includes('cursor')) returnsCursors = true;
            }
        });

    return {
        params,
        returnsCursors
    };
};
