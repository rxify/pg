export type CommandLine = {
    name: string;
    description: string;
    arguments?: ArgumentLine[];
    options?: HelpLine[];
    flags?: HelpLine[];
    line?: string;
};

export type HelpLine = {
    title?: string;
    name: string;
    description: string;
    line?: string;
};

export type ArgumentLine = HelpLine & {
    options?: OptionLine[];
    flags?: HelpLine[];
};

export type OptionLine = HelpLine & {
    options?: string;
    defaultOpt?: string;
    type?: 'array' | 'number' | 'boolean';
};

export type HelpLineFormatted = {
    line: string;
    children?: HelpLineFormatted[];
};
