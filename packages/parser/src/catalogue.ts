export class Catalogue<T> extends Map<string, T> {
    getIfExists(key: string) {
        const val =
            super.get(key.toUpperCase()) ??
            super.get(key.toLowerCase()) ??
            super.get(key);

        if (!val) {
            throw new Error(`${key} does not exist in ${Catalogue.prototype}`);
        }

        return val;
    }
}
