export declare type ArgType = 'string' | 'number' | 'boolean' | 'array' | null;

export declare type Arg<T extends ArgType> = T extends 'string'
    ? string
    : T extends 'number'
    ? number
    : T extends 'boolean'
    ? boolean
    : T extends 'array'
    ? any[]
    : T extends null
    ? null
    : never;

export declare type ArgDef = Record<string, ArgOptions<any>>;

export declare type ArgOptions<T extends ArgType> = {
    long: string;
    short?: string;
    type?: T;
    required?: boolean;
    childArgs?: ArgDef;
};

export declare type ParsedArg = {
    type?: ArgType;
    long: string;
    short?: string;
    index: number;
};
