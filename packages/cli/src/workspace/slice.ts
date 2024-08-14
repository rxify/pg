declare type SliceOptions = {
    lowercase?: boolean;
    offsetStart?: number;
    offsetEnd?: number;
    trim?: boolean;
};

export function slice(
    str: string,
    start: string,
    opts?: SliceOptions & {
        end?: string;
    }
): string;

export function slice(
    str: string,
    start: string,
    end?: string,
    opts?: SliceOptions
): string;

export function slice(
    str: string,
    start: string,
    endOrOpts?: SliceOptions | string,
    opts?: SliceOptions & {
        end?: string;
    }
): string {
    let { end, lowercase, offsetEnd, offsetStart, trim } = ((): SliceOptions & {
        end?: string;
    } => {
        // Signature 1
        if (typeof endOrOpts === 'object') return endOrOpts;
        // Signature 2
        return {
            end: endOrOpts,
            ...(opts ?? {})
        };
    })();

    offsetStart ??= 0;
    offsetEnd ??= 0;
    lowercase ??= true;
    trim ??= true;

    let _str = lowercase ? str.toLowerCase() : str;

    if (end) {
        return str
            .substring(
                _str.indexOf(start) + start.length + offsetStart,
                _str.indexOf(end) + offsetEnd
            )
            .trim();
    } else {
        return str
            .substring(_str.indexOf(start) + start.length + offsetStart)
            .trim();
    }
}
