import { KEYWORD } from './keywords.js';

/**
 * The type of the keyword.
 */
export enum TYPE {
    /**
     * _Reserved_ keywords are usable only as a _ColLabel_. They cannot be
     * distinguished from variable, type, or function names in some contexts.
     */
    RESERVED = 1,
    /**
     * _Unreserved_ keywords are available for use as any kind of name.
     */
    UNRESERVED = 2,
    /**
     * _Column Name_ keywords can be column, table, etc names.
     *
     * Many of these keywords will be recognized as type or function
     * names too, but they have special productions for the purpose and so
     * can't be treated as "generic" type or function names.
     *
     * These names are not usable as function names because they can be followed by
     * `(` in typename productions, which looks too much like a function call
     * for an `LR(1)` parser.
     */
    COL_NAME = 3,
    /**
     * _TYPE_FUNC_NAME_ keywords can be type or function names.
     *
     * Most of these are keywords that are used as operators in expressions.
     * In general such keywords can't be column names because they would be
     * ambiguous with variables, but they are unambiguous as function identifiers.
     *
     * Do not include `POSITION`, `SUBSTRING`, etc here since they have explicit
     * productions in `a_expr` to support the goofy `SQL9x` argument syntax.
     * - Thomas 2000-11-28
     */
    TYPE_FUNC_NAME = 4
}

/**
 * Keywords that can be used as a `bare_label` (i.e. keywords that
 * can be used as column names when not preceded by `AS`) have this
 * property set to `true`.
 *
 * A keywords is marked as BARE_LABEL in its {@link MAKE_KEYWORD}
 * function below.
 */
export const BARE_LABEL = true;

/**
 * Mark keyword as `BARE_LABEL` if it is included in
 * {@link KEYWORD.BARE_LABEL}, or `AS_LABEL` if it is not.
 */
export const AS_LABEL = false;

/**
 * Defines a postgresql keyword
 */
export declare interface PG_KEYWORD {
    id: KEYWORD;

    /**
     * A keyword can be one of...
     *
     * | Type                        | Description                                                                                 |
     * | --------------------------- | ------------------------------------------------------------------------------------------- |
     * | {@link TYPE.RESERVED}       | Usable only as a _ColLabel_.                                                                |
     * | {@link TYPE.UNRESERVED}     | Available for use as any kind of name.                                                      |
     * | {@link TYPE.COL_NAME}       | Can be column, table, etc names.                                                            |
     * | {@link TYPE.TYPE_FUNC_NAME} | Can be type or function names. Most are keywords that are used as operators in expressions. |
     **/
    type: TYPE;
    /**
     * Keywords that can be used as a `bare_label` (i.e. keywords that
     * can be used as column names when not preceded by `AS`) have this
     * property set to `true`.
     *
     * A keywords is marked as BARE_LABEL in its {@link MAKE_KEYWORD}
     * function below.
     */
    bare_label: boolean;
}

/**
 * Holds all PG keywords.
 */
export const PG_KEYWORDS: Map<string, PG_KEYWORD> = new Map<
    string,
    PG_KEYWORD
>();

/**
 * Associates a keyword name with a code and type and defines
 * whether it is a `BARE_LABEL` or a `LABEL`. See {@link BARE_LABEL}
 * and {@link AS_LABEL}.
 * @param name The name of the keyword
 * @param id The keyword's reference code
 * @param type The keyword's type
 * @param bare_label
 */
const MAKE_KEYWORD = (
    // @ts-ignore
    name: string,
    id: KEYWORD,
    type: TYPE,
    bare_label: boolean
) => {
    PG_KEYWORDS.set(KEYWORD[id], {
        id,
        type,
        bare_label
    });
};

MAKE_KEYWORD('abort', KEYWORD.ABORT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('absent', KEYWORD.ABSENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('absolute', KEYWORD.ABSOLUTE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('access', KEYWORD.ACCESS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('action', KEYWORD.ACTION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('add', KEYWORD.ADD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('admin', KEYWORD.ADMIN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('after', KEYWORD.AFTER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('aggregate', KEYWORD.AGGREGATE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('all', KEYWORD.ALL, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('also', KEYWORD.ALSO, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('alter', KEYWORD.ALTER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('always', KEYWORD.ALWAYS, TYPE.UNRESERVED, BARE_LABEL);
/* British spelling */
MAKE_KEYWORD('analyse', KEYWORD.ANALYSE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('analyze', KEYWORD.ANALYZE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('and', KEYWORD.AND, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('any', KEYWORD.ANY, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('array', KEYWORD.ARRAY, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('as', KEYWORD.AS, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('asc', KEYWORD.ASC, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('asensitive', KEYWORD.ASENSITIVE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('assertion', KEYWORD.ASSERTION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('assignment', KEYWORD.ASSIGNMENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('asymmetric', KEYWORD.ASYMMETRIC, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('at', KEYWORD.AT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('atomic', KEYWORD.ATOMIC, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('attach', KEYWORD.ATTACH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('attribute', KEYWORD.ATTRIBUTE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'authorization',
    KEYWORD.AUTHORIZATION,
    TYPE.TYPE_FUNC_NAME,
    BARE_LABEL
);
MAKE_KEYWORD('backward', KEYWORD.BACKWARD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('before', KEYWORD.BEFORE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('begin', KEYWORD.BEGIN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('between', KEYWORD.BETWEEN, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('bigint', KEYWORD.BIGINT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('binary', KEYWORD.BINARY, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('bit', KEYWORD.BIT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('boolean', KEYWORD.BOOLEAN, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('both', KEYWORD.BOTH, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('breadth', KEYWORD.BREADTH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('by', KEYWORD.BY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('cache', KEYWORD.CACHE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('call', KEYWORD.CALL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('called', KEYWORD.CALLED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('cascade', KEYWORD.CASCADE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('cascaded', KEYWORD.CASCADED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('case', KEYWORD.CASE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('cast', KEYWORD.CAST, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('catalog', KEYWORD.CATALOG, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('chain', KEYWORD.CHAIN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('char', KEYWORD.CHAR, TYPE.COL_NAME, AS_LABEL);
MAKE_KEYWORD('character', KEYWORD.CHARACTER, TYPE.COL_NAME, AS_LABEL);
MAKE_KEYWORD(
    'characteristics',
    KEYWORD.CHARACTERISTICS,
    TYPE.UNRESERVED,
    BARE_LABEL
);
MAKE_KEYWORD('check', KEYWORD.CHECK, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('checkpoint', KEYWORD.CHECKPOINT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('class', KEYWORD.CLASS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('close', KEYWORD.CLOSE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('cluster', KEYWORD.CLUSTER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('coalesce', KEYWORD.COALESCE, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('collate', KEYWORD.COLLATE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('collation', KEYWORD.COLLATION, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('column', KEYWORD.COLUMN, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('columns', KEYWORD.COLUMNS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('comment', KEYWORD.COMMENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('comments', KEYWORD.COMMENTS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('commit', KEYWORD.COMMIT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('committed', KEYWORD.COMMITTED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('compression', KEYWORD.COMPRESSION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'concurrently',
    KEYWORD.CONCURRENTLY,
    TYPE.TYPE_FUNC_NAME,
    BARE_LABEL
);
MAKE_KEYWORD('conditional', KEYWORD.CONDITIONAL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'configuration',
    KEYWORD.CONFIGURATION,
    TYPE.UNRESERVED,
    BARE_LABEL
);
MAKE_KEYWORD('conflict', KEYWORD.CONFLICT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('connection', KEYWORD.CONNECTION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('constraint', KEYWORD.CONSTRAINT, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('constraints', KEYWORD.CONSTRAINTS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('content', KEYWORD.CONTENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('continue', KEYWORD.CONTINUE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('conversion', KEYWORD.CONVERSION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('copy', KEYWORD.COPY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('cost', KEYWORD.COST, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('create', KEYWORD.CREATE, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('cross', KEYWORD.CROSS, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('csv', KEYWORD.CSV, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('cube', KEYWORD.CUBE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('current', KEYWORD.CURRENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'current_catalog',
    KEYWORD.CURRENT_CATALOG,
    TYPE.RESERVED,
    BARE_LABEL
);
MAKE_KEYWORD('current_date', KEYWORD.CURRENT_DATE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('current_role', KEYWORD.CURRENT_ROLE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'current_schema',
    KEYWORD.CURRENT_SCHEMA,
    TYPE.TYPE_FUNC_NAME,
    BARE_LABEL
);
MAKE_KEYWORD('current_time', KEYWORD.CURRENT_TIME, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'current_timestamp',
    KEYWORD.CURRENT_TIMESTAMP,
    TYPE.RESERVED,
    BARE_LABEL
);
MAKE_KEYWORD('current_user', KEYWORD.CURRENT_USER, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('cursor', KEYWORD.CURSOR, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('cycle', KEYWORD.CYCLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('data', KEYWORD.DATA, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('database', KEYWORD.DATABASE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('day', KEYWORD.DAY, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('deallocate', KEYWORD.DEALLOCATE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('dec', KEYWORD.DEC, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('decimal', KEYWORD.DECIMAL, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('declare', KEYWORD.DECLARE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('default', KEYWORD.DEFAULT, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('defaults', KEYWORD.DEFAULTS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('deferrable', KEYWORD.DEFERRABLE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('deferred', KEYWORD.DEFERRED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('definer', KEYWORD.DEFINER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('delete', KEYWORD.DELETE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('delimiter', KEYWORD.DELIMITER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('delimiters', KEYWORD.DELIMITERS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('depends', KEYWORD.DEPENDS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('depth', KEYWORD.DEPTH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('desc', KEYWORD.DESC, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('detach', KEYWORD.DETACH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('dictionary', KEYWORD.DICTIONARY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('disable', KEYWORD.DISABLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('discard', KEYWORD.DISCARD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('distinct', KEYWORD.DISTINCT, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('do', KEYWORD.DO, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('document', KEYWORD.DOCUMENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('domain', KEYWORD.DOMAIN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('double', KEYWORD.DOUBLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('drop', KEYWORD.DROP, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('each', KEYWORD.EACH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('else', KEYWORD.ELSE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('empty', KEYWORD.EMPTY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('enable', KEYWORD.ENABLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('encoding', KEYWORD.ENCODING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('encrypted', KEYWORD.ENCRYPTED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('end', KEYWORD.END, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('enum', KEYWORD.ENUM, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('error', KEYWORD.ERROR, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('escape', KEYWORD.ESCAPE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('event', KEYWORD.EVENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('except', KEYWORD.EXCEPT, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('exclude', KEYWORD.EXCLUDE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('excluding', KEYWORD.EXCLUDING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('exclusive', KEYWORD.EXCLUSIVE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('execute', KEYWORD.EXECUTE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('exists', KEYWORD.EXISTS, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('explain', KEYWORD.EXPLAIN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('expression', KEYWORD.EXPRESSION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('extension', KEYWORD.EXTENSION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('external', KEYWORD.EXTERNAL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('extract', KEYWORD.EXTRACT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('false', KEYWORD.FALSE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('family', KEYWORD.FAMILY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('fetch', KEYWORD.FETCH, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('filter', KEYWORD.FILTER, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('finalize', KEYWORD.FINALIZE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('first', KEYWORD.FIRST, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('float', KEYWORD.FLOAT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('following', KEYWORD.FOLLOWING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('for', KEYWORD.FOR, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('force', KEYWORD.FORCE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('foreign', KEYWORD.FOREIGN, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('format', KEYWORD.FORMAT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('forward', KEYWORD.FORWARD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('freeze', KEYWORD.FREEZE, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('from', KEYWORD.FROM, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('full', KEYWORD.FULL, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('function', KEYWORD.FUNCTION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('functions', KEYWORD.FUNCTIONS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('generated', KEYWORD.GENERATED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('global', KEYWORD.GLOBAL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('grant', KEYWORD.GRANT, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('granted', KEYWORD.GRANTED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('greatest', KEYWORD.GREATEST, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('group', KEYWORD.GROUP, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('grouping', KEYWORD.GROUPING, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('groups', KEYWORD.GROUPS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('handler', KEYWORD.HANDLER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('having', KEYWORD.HAVING, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('header', KEYWORD.HEADER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('hold', KEYWORD.HOLD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('hour', KEYWORD.HOUR, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('identity', KEYWORD.IDENTITY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('if', KEYWORD.IF, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('ilike', KEYWORD.ILIKE, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('immediate', KEYWORD.IMMEDIATE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('immutable', KEYWORD.IMMUTABLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('implicit', KEYWORD.IMPLICIT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('import', KEYWORD.IMPORT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('in', KEYWORD.IN, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('include', KEYWORD.INCLUDE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('including', KEYWORD.INCLUDING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('increment', KEYWORD.INCREMENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('indent', KEYWORD.INDENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('index', KEYWORD.INDEX, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('indexes', KEYWORD.INDEXES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('inherit', KEYWORD.INHERIT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('inherits', KEYWORD.INHERITS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('initially', KEYWORD.INITIALLY, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('inline', KEYWORD.INLINE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('inner', KEYWORD.INNER, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('inout', KEYWORD.INOUT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('input', KEYWORD.INPUT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('insensitive', KEYWORD.INSENSITIVE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('insert', KEYWORD.INSERT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('instead', KEYWORD.INSTEAD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('int', KEYWORD.INT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('integer', KEYWORD.INTEGER, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('intersect', KEYWORD.INTERSECT, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('interval', KEYWORD.INTERVAL, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('into', KEYWORD.INTO, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('invoker', KEYWORD.INVOKER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('is', KEYWORD.IS, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('isnull', KEYWORD.ISNULL, TYPE.TYPE_FUNC_NAME, AS_LABEL);
MAKE_KEYWORD('isolation', KEYWORD.ISOLATION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('join', KEYWORD.JOIN, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('json', KEYWORD.JSON, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('json_array', KEYWORD.JSON_ARRAY, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('json_arrayagg', KEYWORD.JSON_ARRAYAGG, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('json_exists', KEYWORD.JSON_EXISTS, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('json_object', KEYWORD.JSON_OBJECT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD(
    'json_objectagg',
    KEYWORD.JSON_OBJECTAGG,
    TYPE.COL_NAME,
    BARE_LABEL
);
MAKE_KEYWORD('json_query', KEYWORD.JSON_QUERY, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('json_scalar', KEYWORD.JSON_SCALAR, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD(
    'json_serialize',
    KEYWORD.JSON_SERIALIZE,
    TYPE.COL_NAME,
    BARE_LABEL
);
MAKE_KEYWORD('json_table', KEYWORD.JSON_TABLE, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('json_value', KEYWORD.JSON_VALUE, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('keep', KEYWORD.KEEP, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('key', KEYWORD.KEY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('keys', KEYWORD.KEYS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('label', KEYWORD.LABEL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('language', KEYWORD.LANGUAGE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('large', KEYWORD.LARGE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('last', KEYWORD.LAST, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('lateral', KEYWORD.LATERAL, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('leading', KEYWORD.LEADING, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('leakproof', KEYWORD.LEAKPROOF, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('least', KEYWORD.LEAST, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('left', KEYWORD.LEFT, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('level', KEYWORD.LEVEL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('like', KEYWORD.LIKE, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('limit', KEYWORD.LIMIT, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('listen', KEYWORD.LISTEN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('load', KEYWORD.LOAD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('local', KEYWORD.LOCAL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('localtime', KEYWORD.LOCALTIME, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'localtimestamp',
    KEYWORD.LOCALTIMESTAMP,
    TYPE.RESERVED,
    BARE_LABEL
);
MAKE_KEYWORD('location', KEYWORD.LOCATION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('lock', KEYWORD.LOCK, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('locked', KEYWORD.LOCKED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('logged', KEYWORD.LOGGED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('mapping', KEYWORD.MAPPING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('match', KEYWORD.MATCH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('matched', KEYWORD.MATCHED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('materialized', KEYWORD.MATERIALIZED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('maxvalue', KEYWORD.MAXVALUE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('merge', KEYWORD.MERGE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('merge_action', KEYWORD.MERGE_ACTION, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('method', KEYWORD.METHOD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('minute', KEYWORD.MINUTE, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('minvalue', KEYWORD.MINVALUE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('mode', KEYWORD.MODE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('month', KEYWORD.MONTH, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('move', KEYWORD.MOVE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('name', KEYWORD.NAME, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('names', KEYWORD.NAMES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('national', KEYWORD.NATIONAL, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('natural', KEYWORD.NATURAL, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('nchar', KEYWORD.NCHAR, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('nested', KEYWORD.NESTED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('new', KEYWORD.NEW, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('next', KEYWORD.NEXT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('nfc', KEYWORD.NFC, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('nfd', KEYWORD.NFD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('nfkc', KEYWORD.NFKC, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('nfkd', KEYWORD.NFKD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('no', KEYWORD.NO, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('none', KEYWORD.NONE, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('normalize', KEYWORD.NORMALIZE, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('normalized', KEYWORD.NORMALIZED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('not', KEYWORD.NOT, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('nothing', KEYWORD.NOTHING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('notify', KEYWORD.NOTIFY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('notnull', KEYWORD.NOTNULL, TYPE.TYPE_FUNC_NAME, AS_LABEL);
MAKE_KEYWORD('nowait', KEYWORD.NOWAIT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('null', KEYWORD.NULL, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('nullif', KEYWORD.NULLIF, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('nulls', KEYWORD.NULLS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('numeric', KEYWORD.NUMERIC, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('object', KEYWORD.OBJECT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('of', KEYWORD.OF, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('off', KEYWORD.OFF, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('offset', KEYWORD.OFFSET, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('oids', KEYWORD.OIDS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('old', KEYWORD.OLD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('omit', KEYWORD.OMIT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('on', KEYWORD.ON, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('only', KEYWORD.ONLY, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('operator', KEYWORD.OPERATOR, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('option', KEYWORD.OPTION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('options', KEYWORD.OPTIONS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('or', KEYWORD.OR, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('order', KEYWORD.ORDER, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('ordinality', KEYWORD.ORDINALITY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('others', KEYWORD.OTHERS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('out', KEYWORD.OUT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('outer', KEYWORD.OUTER, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('over', KEYWORD.OVER, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('overlaps', KEYWORD.OVERLAPS, TYPE.TYPE_FUNC_NAME, AS_LABEL);
MAKE_KEYWORD('overlay', KEYWORD.OVERLAY, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('overriding', KEYWORD.OVERRIDING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('owned', KEYWORD.OWNED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('owner', KEYWORD.OWNER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('parallel', KEYWORD.PARALLEL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('parameter', KEYWORD.PARAMETER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('parser', KEYWORD.PARSER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('partial', KEYWORD.PARTIAL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('partition', KEYWORD.PARTITION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('partitions', KEYWORD.PARTITIONS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('passing', KEYWORD.PASSING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('password', KEYWORD.PASSWORD, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('path', KEYWORD.PATH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('placing', KEYWORD.PLACING, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('plan', KEYWORD.PLAN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('plans', KEYWORD.PLANS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('policy', KEYWORD.POLICY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('position', KEYWORD.POSITION, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('preceding', KEYWORD.PRECEDING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('precision', KEYWORD.PRECISION, TYPE.COL_NAME, AS_LABEL);
MAKE_KEYWORD('prepare', KEYWORD.PREPARE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('prepared', KEYWORD.PREPARED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('preserve', KEYWORD.PRESERVE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('primary', KEYWORD.PRIMARY, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('prior', KEYWORD.PRIOR, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('privileges', KEYWORD.PRIVILEGES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('procedural', KEYWORD.PROCEDURAL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('procedure', KEYWORD.PROCEDURE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('procedures', KEYWORD.PROCEDURES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('program', KEYWORD.PROGRAM, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('publication', KEYWORD.PUBLICATION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('quote', KEYWORD.QUOTE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('quotes', KEYWORD.QUOTES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('range', KEYWORD.RANGE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('read', KEYWORD.READ, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('real', KEYWORD.REAL, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('reassign', KEYWORD.REASSIGN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('recheck', KEYWORD.RECHECK, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('recursive', KEYWORD.RECURSIVE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('ref', KEYWORD.REF, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('references', KEYWORD.REFERENCES, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('referencing', KEYWORD.REFERENCING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('refresh', KEYWORD.REFRESH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('reindex', KEYWORD.REINDEX, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('relative', KEYWORD.RELATIVE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('release', KEYWORD.RELEASE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('rename', KEYWORD.RENAME, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('repeatable', KEYWORD.REPEATABLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('replace', KEYWORD.REPLACE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('replica', KEYWORD.REPLICA, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('reset', KEYWORD.RESET, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('restart', KEYWORD.RESTART, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('restrict', KEYWORD.RESTRICT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('return', KEYWORD.RETURN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('returning', KEYWORD.RETURNING, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('returns', KEYWORD.RETURNS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('revoke', KEYWORD.REVOKE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('right', KEYWORD.RIGHT, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('role', KEYWORD.ROLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('rollback', KEYWORD.ROLLBACK, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('rollup', KEYWORD.ROLLUP, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('routine', KEYWORD.ROUTINE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('routines', KEYWORD.ROUTINES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('row', KEYWORD.ROW, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('rows', KEYWORD.ROWS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('rule', KEYWORD.RULE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('savepoint', KEYWORD.SAVEPOINT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('scalar', KEYWORD.SCALAR, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('schema', KEYWORD.SCHEMA, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('schemas', KEYWORD.SCHEMAS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('scroll', KEYWORD.SCROLL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('search', KEYWORD.SEARCH, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('second', KEYWORD.SECOND, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('security', KEYWORD.SECURITY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('select', KEYWORD.SELECT, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('sequence', KEYWORD.SEQUENCE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('sequences', KEYWORD.SEQUENCES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('serializable', KEYWORD.SERIALIZABLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('server', KEYWORD.SERVER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('session', KEYWORD.SESSION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('session_user', KEYWORD.SESSION_USER, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('set', KEYWORD.SET, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('setof', KEYWORD.SETOF, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('sets', KEYWORD.SETS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('share', KEYWORD.SHARE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('show', KEYWORD.SHOW, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('similar', KEYWORD.SIMILAR, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('simple', KEYWORD.SIMPLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('skip', KEYWORD.SKIP, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('smallint', KEYWORD.SMALLINT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('snapshot', KEYWORD.SNAPSHOT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('some', KEYWORD.SOME, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('source', KEYWORD.SOURCE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('split', KEYWORD.SPLIT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('sql', KEYWORD.SQL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('stable', KEYWORD.STABLE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('standalone', KEYWORD.STANDALONE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('start', KEYWORD.START, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('statement', KEYWORD.STATEMENT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('statistics', KEYWORD.STATISTICS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('stdin', KEYWORD.STDIN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('stdout', KEYWORD.STDOUT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('storage', KEYWORD.STORAGE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('stored', KEYWORD.STORED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('strict', KEYWORD.STRICT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('string', KEYWORD.STRING, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('strip', KEYWORD.STRIP, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('subscription', KEYWORD.SUBSCRIPTION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('substring', KEYWORD.SUBSTRING, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('support', KEYWORD.SUPPORT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('sum', KEYWORD.SUM, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('symmetric', KEYWORD.SYMMETRIC, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('sysid', KEYWORD.SYSID, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('system', KEYWORD.SYSTEM, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('system_user', KEYWORD.SYSTEM_USER, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('table', KEYWORD.TABLE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('tables', KEYWORD.TABLES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'tablesample',
    KEYWORD.TABLESAMPLE,
    TYPE.TYPE_FUNC_NAME,
    BARE_LABEL
);
MAKE_KEYWORD('tablespace', KEYWORD.TABLESPACE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('target', KEYWORD.TARGET, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('temp', KEYWORD.TEMP, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('template', KEYWORD.TEMPLATE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('temporary', KEYWORD.TEMPORARY, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('text', KEYWORD.TEXT, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('then', KEYWORD.THEN, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('ties', KEYWORD.TIES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('time', KEYWORD.TIME, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('timestamp', KEYWORD.TIMESTAMP, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('to', KEYWORD.TO, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('trailing', KEYWORD.TRAILING, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('transaction', KEYWORD.TRANSACTION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('transform', KEYWORD.TRANSFORM, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('treat', KEYWORD.TREAT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('trigger', KEYWORD.TRIGGER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('trim', KEYWORD.TRIM, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('true', KEYWORD.TRUE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('truncate', KEYWORD.TRUNCATE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('trusted', KEYWORD.TRUSTED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('type', KEYWORD.TYPE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('types', KEYWORD.TYPES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('uescape', KEYWORD.UESCAPE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('unbounded', KEYWORD.UNBOUNDED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('uncommitted', KEYWORD.UNCOMMITTED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD(
    'unconditional',
    KEYWORD.UNCONDITIONAL,
    TYPE.UNRESERVED,
    BARE_LABEL
);
MAKE_KEYWORD('unencrypted', KEYWORD.UNENCRYPTED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('union', KEYWORD.UNION, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('unique', KEYWORD.UNIQUE, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('unknown', KEYWORD.UNKNOWN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('unlisten', KEYWORD.UNLISTEN, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('unlogged', KEYWORD.UNLOGGED, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('until', KEYWORD.UNTIL, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('update', KEYWORD.UPDATE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('user', KEYWORD.USER, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('using', KEYWORD.USING, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('vacuum', KEYWORD.VACUUM, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('valid', KEYWORD.VALID, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('validate', KEYWORD.VALIDATE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('validator', KEYWORD.VALIDATOR, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('value', KEYWORD.VALUE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('values', KEYWORD.VALUES, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('varchar', KEYWORD.VARCHAR, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('variadic', KEYWORD.VARIADIC, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('varying', KEYWORD.VARYING, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('verbose', KEYWORD.VERBOSE, TYPE.TYPE_FUNC_NAME, BARE_LABEL);
MAKE_KEYWORD('version', KEYWORD.VERSION, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('view', KEYWORD.VIEW, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('views', KEYWORD.VIEWS, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('volatile', KEYWORD.VOLATILE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('when', KEYWORD.WHEN, TYPE.RESERVED, BARE_LABEL);
MAKE_KEYWORD('where', KEYWORD.WHERE, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('whitespace', KEYWORD.WHITESPACE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('window', KEYWORD.WINDOW, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('with', KEYWORD.WITH, TYPE.RESERVED, AS_LABEL);
MAKE_KEYWORD('within', KEYWORD.WITHIN, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('without', KEYWORD.WITHOUT, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('work', KEYWORD.WORK, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('wrapper', KEYWORD.WRAPPER, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('write', KEYWORD.WRITE, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('xml', KEYWORD.XML, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('xmlattributes', KEYWORD.XMLATTRIBUTES, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlconcat', KEYWORD.XMLCONCAT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlelement', KEYWORD.XMLELEMENT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlexists', KEYWORD.XMLEXISTS, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlforest', KEYWORD.XMLFOREST, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlnamespaces', KEYWORD.XMLNAMESPACES, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlparse', KEYWORD.XMLPARSE, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlpi', KEYWORD.XMLPI, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlroot', KEYWORD.XMLROOT, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmlserialize', KEYWORD.XMLSERIALIZE, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('xmltable', KEYWORD.XMLTABLE, TYPE.COL_NAME, BARE_LABEL);
MAKE_KEYWORD('year', KEYWORD.YEAR, TYPE.UNRESERVED, AS_LABEL);
MAKE_KEYWORD('yes', KEYWORD.YES, TYPE.UNRESERVED, BARE_LABEL);
MAKE_KEYWORD('zone', KEYWORD.ZONE, TYPE.UNRESERVED, BARE_LABEL);
