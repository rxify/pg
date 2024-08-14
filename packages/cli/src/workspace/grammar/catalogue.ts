export class Catalogue<T> extends Map<string, T> {
    override has(key: string) {
        return (
            (super.has(key) ??
                super.has(key.toUpperCase()) ??
                super.has(key.toLowerCase())) !== undefined
        );
    }

    getIfExists(key: string) {
        const val =
            super.get(key) ??
            super.get(key.toUpperCase()) ??
            super.get(key.toLowerCase());

        if (!val) {
            throw new Error(`${key} does not exist in ${Catalogue.prototype}`);
        }

        return val;
    }
}
