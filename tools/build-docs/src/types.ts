export type Program = {
    id: number;
    name: string;
    variant: string;
    kind: number;
    flags: GetSignatureFlags;
    children: File[];
    groups: Group[];
    packageName: string;
    readme: ReadmeNode[];
    symbolIdMap: { [key: string]: SymbolIdMap };
};

export type Variant = 'declaration' | 'signature';

export type File = {
    id: number;
    name: string;
    variant: Variant;
    kind: number;
    flags: GetSignatureFlags;
    comment?: ChildComment;
    children?: Node[];
    groups?: Group[];
    sources: Source[];
    extendedTypes?: ExtendedType[];
    type?: IndecentType;
    typeParameters?: ChildTypeParameter[];
    signatures?: FluffySignature[];
};

export type Node = {
    id: number;
    name: string;
    variant: Variant;
    kind: number;
    flags: PurpleFlags;
    sources: Source[];
    signatures?: PurpleSignature[];
    overwrites?: InheritedFrom;
    type?: TentacledType;
    inheritedFrom?: InheritedFrom;
    getSignature?: GetSignature;
};

export type PurpleFlags = {
    isProtected?: boolean;
    isPublic?: boolean;
    isPrivate?: boolean;
    isOptional?: boolean;
};

export type GetSignature = {
    id: number;
    name: string;
    variant: Variant;
    kind: number;
    flags: GetSignatureFlags;
    comment?: GetSignatureComment;
    sources: Source[];
    type: ExtendedType;
    inheritedFrom?: InheritedFrom;
};

export type GetSignatureComment = {
    summary: ReadmeNode[];
};

export type ReadmeNode = {
    kind: Kind;
    text: string;
};

export type Kind = 'text' | 'code';

export type GetSignatureFlags = {};

export type InheritedFrom = {
    type: ValueEnum;
    target: number;
    name: string;
};

export type ValueEnum =
    | 'reference'
    | 'intrinsic'
    | 'array'
    | 'signature'
    | 'param';

export type Source = {
    fileName: string;
    line: number;
    character: number;
    url: string;
};

export type ExtendedType = {
    type: ValueEnum;
    target?: SymbolIdMap;
    typeArguments?: ExtendedType[];
    name?: string;
    package?: string;
    elementType?: ElementType;
};

export type ElementType = {
    type: ValueEnum;
    name: ElementTypeName;
};

export type ElementTypeName = 'any' | 'string';

export type SymbolIdMap = {
    sourceFileName: string;
    qualifiedName: string;
};

export type PurpleSignature = {
    id: number;
    name: string;
    variant: Variant;
    kind: number;
    flags: GetSignatureFlags;
    sources: Source[];
    parameters?: PurpleParameter[];
    type: DeclarationType;
    overwrites?: InheritedFrom;
    comment?: GetSignatureComment;
    inheritedFrom?: InheritedFrom;
    typeParameter?: PurpleTypeParameter[];
};

export type PurpleParameter = {
    id: number;
    name: string;
    variant: Variant;
    kind: number;
    flags: ParameterFlags;
    type: PurpleType;
    comment?: GetSignatureComment;
};

export type ParameterFlags = {
    isOptional?: boolean;
};

export type PurpleType = {
    type: string;
    types?: TargetTypeElement[];
    target?: SymbolIdMap | number;
    name?: string;
    package?: string;
    refersToTypeParameter?: boolean;
    value?: string;
    typeArguments?: TypeArgumentElement[];
    elementType?: ElementType;
};

export type TypeArgumentElement = {
    type: ValueEnum;
    target?: number;
    name?: string;
    package?: string;
    refersToTypeParameter?: boolean;
    elementType?: ElementType;
};

export type TargetTypeElement = {
    type: TargetTypeTypeEnum;
    name?: string;
    target?: SymbolIdMap | number;
    package?: string;
    typeArguments?: TypeArgumentElement[];
    value?: string;
};

export type TargetTypeTypeEnum = 'intrinsic' | 'reference' | 'literal';

export type Declaration = {
    id: number;
    name: string;
    variant: 'declaration';
    kind: number;
    flags: GetSignatureFlags;
    children?: DeclarationChild[];
    groups?: Group[];
    sources: Source[];
    type?: DeclarationType;
};

export type TypeArgument = {
    type: HilariousType;
    target?: SymbolIdMap | number;
    name?: string;
    package?: string;
    refersToTypeParameter?: boolean;
    typeArguments?: TypeArgumentElement[];
    declaration?: Declaration;
};

export type DeclarationType = {
    type: ValueEnum;
    target?: SymbolIdMap | number;
    name: string;
    package?: string;
    typeArguments?: TypeArgument[];
};

export type DeclarationChild = {
    id: number;
    name: string;
    variant: 'declaration';
    kind: number;
    flags: ParameterFlags;
    sources: Source[];
    type: FluffyType;
};

export type FluffyType = {
    type: TargetTypeTypeEnum;
    target?: SymbolIdMap | number;
    name?: string;
    package?: string;
    value?: ValueEnum;
};

export type Group = {
    title: string;
    children: number[];
};

export type HilariousType = 'reference' | 'intrinsic' | 'reflection';

export type PurpleTypeParameter = {
    id: number;
    name: string;
    variant: string;
    kind: number;
    flags: GetSignatureFlags;
    type?: ExtendedType;
    default?: PurpleDefault;
};

export type PurpleDefault = {
    type: ValueEnum;
    elementType?: ElementType;
    name?: ElementTypeName;
};

export type TentacledType = {
    type: string;
    types?: ExtendedType[];
    target?: SymbolIdMap;
    typeArguments?: ExtendedType[];
    name?: string;
    package?: string;
};

export type ChildComment = {
    summary: ReadmeNode[];
    blockTags?: BlockTag[];
};

export type BlockTag = {
    tag: string;
    content: ReadmeNode[];
};

export type FluffySignature = {
    id: number;
    name: string;
    variant: Variant;
    kind: number;
    flags: GetSignatureFlags;
    comment: ChildComment;
    sources: Source[];
    parameters: FluffyParameter[];
    type: IndigoType;
    typeParameter?: FluffyTypeParameter[];
};

export type FluffyParameter = {
    id: number;
    name: string;
    variant: Variant;
    kind: number;
    flags: ParameterFlags;
    type: StickyType;
    comment?: GetSignatureComment;
};

export type StickyType = {
    type: string;
    name?: string;
    operator?: string;
    target?: TargetClass | number;
    types?: ExtendedType[];
    elementType?: ElementType;
    package?: string;
};

export type TargetClass = {
    type: ValueEnum;
    elementType: ElementType;
};

export type IndigoType = {
    type: string;
    name: string;
    asserts?: boolean;
    targetType?: TargetTypeElement;
    target?: SymbolIdMap;
    typeArguments?: TypeArgumentElement[];
    package?: string;
};

export type FluffyTypeParameter = {
    id: number;
    name: string;
    variant: string;
    kind: number;
    flags: GetSignatureFlags;
    default?: TargetClass;
};

export type IndecentType = {
    type: HilariousType;
    target?: SymbolIdMap;
    name?: string;
    package?: string;
    qualifiedName?: string;
    typeArguments?: TypeArgumentElement[];
    declaration?: Declaration;
};

export type ChildTypeParameter = {
    id: number;
    name: string;
    variant: string;
    kind: number;
    flags: GetSignatureFlags;
    default: PurpleDefault;
    type?: TypeArgumentElement;
};
