export declare type Cli = {
    name: string;
    commands?: Command[];
    globalFlags?: Flag[];
};

export declare type Command = {
    name: string;
    description: string;
    args?: Argument[];
    options?: Option[];
    flags?: Flag[];
};

export declare type Argument = CliElement & {
    options?: Option[];
    flags?: Flag[];
};

export declare type Option = CliElement & {
    choices?: string[];
    defaultOpt?: string;
    type?: 'array' | 'number' | 'boolean';
};

export declare type Flag = CliElement;

export declare type CliElement = {
    name: string | string[];
    description: string;
    alias?: string;
};
