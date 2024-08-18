export declare type OrphanBehavior =
    | 'CONSUME_ORPHAN'
    | 'DISCARD_ORPHAN'
    | 'UNSHIFT_ORPHAN';

function isOrphanBehavior(val: any): val is OrphanBehavior {
    return (
        val &&
        typeof val === 'string' &&
        (val === 'CONSUME_ORPHAN' ||
            val === 'DISCARD_ORPHAN' ||
            val === 'UNSHIFT_ORPHAN')
    );
}

export declare interface Token {
    value: string;
    position: number;
    type: any;
}

declare type Consume<T> = {
    until: (until: (val: T) => boolean) => T[];
    while: (whle: (elm: T) => boolean) => T[];
};

export abstract class Tokenizer<T, R extends Token> {
    public tokens: R[] = [];
    public length: number;

    private _val: T | undefined;

    constructor(public vals: T[]) {
        this.length = vals.length;
    }

    public get position(): number {
        return this.length - this.tokens.length;
    }

    public tokenize() {
        while ((this._val = this.vals.shift())) {
            this.while(this._val);
        }
        return this;
    }

    /**
     * Executed on each val in `vals`
     * @param val The next token unshifted from `vals`
     */
    public abstract while(val: T): void;

    /**
     * Consumes tokens while/until a condition is met
     * @param orphanBehavior The action to be executed on the token
     * that's orphaned when the `while` loop exits
     */
    public consume(orphanBehavior?: OrphanBehavior): Consume<T>;

    /**
     * Consumes tokens while/until a condition is met
     * @param last The last val to be unshifted
     * @param orphanBehavior The action to be executed on the token
     * that's orphaned when the `while` loop exits
     */
    public consume(last: T, orphanBehavior?: OrphanBehavior): Consume<T>;

    public consume(...args: (OrphanBehavior | T | undefined)[]): Consume<T> {
        let orphanBehavior: OrphanBehavior = 'UNSHIFT_ORPHAN';
        let val: T | undefined;

        args.forEach((arg) => {
            if (isOrphanBehavior(arg)) {
                orphanBehavior = arg;
            } else {
                val = arg;
            }
        });

        val ??= this.next();

        const handleOrphan = (elms: T[], elm: T | undefined) => {
            if (elm) {
                switch (orphanBehavior) {
                    case 'CONSUME_ORPHAN':
                        elms.push(elm);
                        return elms;
                    case 'DISCARD_ORPHAN':
                        return elms;
                    case 'UNSHIFT_ORPHAN':
                        this.vals.unshift(elm);
                }
            }

            return elms;
        };

        return {
            until: (until: (val: T) => boolean): T[] => {
                const elms: T[] = [];
                while (val && !until(val)) {
                    elms.push(val);
                    val = this.vals.shift();
                }
                return handleOrphan(elms, val);
            },
            while: (whle: (elm: T) => boolean): T[] => {
                const elms: T[] = [];
                while (val && whle(val)) {
                    elms.push(val);
                    val = this.vals.shift();
                }
                return handleOrphan(elms, val);
            }
        };
    }

    /**
     * Unshifts the next val.
     * @param errMsg An error to throw if unexpected end of input
     * is encountered.
     */
    public next(errMsg?: string): T;

    /**
     * Unshifts the next val.
     * @param count The number of elements to unshift
     * @param errMsg An error to throw if unexpected end of input
     * is encountered.
     */
    public next(count: number, errMsg?: string): T;

    public next(countOrErrMsg?: number | string, errMsgOrNull?: string): T {
        let { count, errMsg } = (() => {
            if (typeof countOrErrMsg === 'number') {
                return { errMsg: errMsgOrNull, count: countOrErrMsg ?? 1 };
            }
            return { count: 1, errMsg: countOrErrMsg };
        })();

        while (true) {
            count -= 1;
            const next = this.vals.shift();
            if (!next) throw errMsg ?? 'Unexpected end of input.';
            if (count === 0) return next;
        }
    }
}
