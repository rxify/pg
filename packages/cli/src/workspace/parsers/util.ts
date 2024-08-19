export function _(str: string) {
    return str.toLowerCase();
}

export function __(str: string) {
    return str.toUpperCase();
}

export function olen(obj: Object) {
    return Object.keys(obj).length;
}
