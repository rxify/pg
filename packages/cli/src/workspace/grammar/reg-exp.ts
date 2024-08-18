export const $ref = /^((\w|_){1,})(?=)\.((\w|_){1,})$/;

export function parseRef(refStr: string) {
    const [schema, ref] = refStr.split('.');

    return {
        schema,
        ref
    };
}

export const $as = /\bas\b/i;
