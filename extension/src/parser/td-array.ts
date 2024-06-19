export class ArrayTD<T> extends Array<T> {
    private _cursor = 0;

    public get validPosn() {
        return this._cursor < this.length && this._cursor >= 0;
    }

    public get posn() {
        return this._cursor;
    }

    public get current(): T {
        return this[this._cursor];
    }

    public get next(): T {
        this.stepForward();
        return this.current;
    }

    public get previous(): T {
        this.stepBack();
        return this.current;
    }

    public stepForward() {
        if (this._cursor < this.length) this._cursor += 1;
        return this[this._cursor];
    }

    public stepBack() {
        if (this._cursor > 0) this._cursor -= 1;
        return this[this._cursor];
    }
}
