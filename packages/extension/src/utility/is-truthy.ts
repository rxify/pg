export const isTruthy = <T>(val: T | null | undefined): val is NonNullable<T> =>
    val !== undefined && val !== null;
