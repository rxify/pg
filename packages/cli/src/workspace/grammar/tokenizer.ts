export declare type OrphanBehavior =
    | 'CONSUME_ORPHAN'
    | 'DISCARD_ORPHAN'
    | 'UNSHIFT_ORPHAN';

export declare interface Token {
    value: string;
    position: number;
    type: any;
}

export abstract class Tokenizer<T, R extends Token> {
    public tokens: R[] = [];
    public length: number;

    private _elm: T | undefined;

    public get position(): number {
        return this.length - this.tokens.length;
    }

    constructor(public elms: T[]) {
        this.length = elms.length;
        while ((this._elm = this.elms.shift())) {
            this.next(this._elm);
        }
    }

    public abstract next(elm: T): void;

    public consume(
        orphanBehavior: OrphanBehavior = 'UNSHIFT_ORPHAN',
        elm: T | undefined = this._elm
    ) {
        const handleOrphan = (elms: T[], elm: T | undefined) => {
            if (elm) {
                switch (orphanBehavior) {
                    case 'CONSUME_ORPHAN':
                        elms.push(elm);
                        return elms;
                    case 'DISCARD_ORPHAN':
                        return elms;
                    case 'UNSHIFT_ORPHAN':
                        elms.unshift(elm);
                }
            }

            return elms;
        };

        return {
            until: (until: (elm: T) => boolean): T[] => {
                const elms: T[] = [];
                while (elm && !until(elm)) {
                    elms.push(elm);
                    elm = this.elms.shift();
                }
                return handleOrphan(elms, elm);
            },
            while: (whle: (elm: T) => boolean): T[] => {
                const elms: T[] = [];
                while (elm && whle(elm)) {
                    elms.push(elm);
                    elm = this.elms.shift();
                }
                return handleOrphan(elms, elm);
            }
        };
    }
}
