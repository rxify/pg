<r>SELECT</r>
<o>FROM</o>
::PARSE_FROM::
<o>WHERE</o>
<o>GROUP</o>
<o>HAVING</o>
<o>WINDOW</o>
[ <r>UNION</r> | <r>INTERSECT</r> | <r>EXCEPT</r> ]
<o>ORDER</o>
<o>LIMIT</o>
<o>OFFSET</o>
<o>FETCH</o>
<o>FOR</o>

::PARSE_FROM::

```sql
<o>WITH</o>
    <o>RECURSIVE</o> ...<v>with_query</v>

<v>with_query_name</v>
    <o>( ...<v>column_name</v> )</o>
    <r>AS</r> <o>[ <o>[ NOT ]</o> MATERIALIZED ]</o>
    <r>( select | values | insert | update | delete )</r>
        <o>SEARCH</o>
            <r>{ BREADTH | DEPTH }</r> <r>FIRST BY</r> ...<v>column_name</v> <r>SET</r> <v>search_seq_col_name</v>
        <o>CYCLE</o>
            <v>...column_name</v> <r>SET</r> <v>cycle_mark_col_name</v>
            <o>[ <r>TO</r> <v>cycle_mark_value</v> <r>DEFAULT</r> <v>cycle_mark_default</v> ]</o>
            <r>USING</r> <v>cycle_path_col_name</v>

SELECT [ ALL | DISTINCT [ ON ( ...expression ) ] ]

[ { * | expression [ [ AS ] output_name ] } [, ...] ]

[ <r>FROM</r>

    <i><o>ONLY</o></i> table_name <o>[*]</o> <o>AS</o> <v>alias</v> <o>(...<v>column_alias</v>)</o> ]
                <o><r>TABLESAMPLE</r> <v>sampling_method</v> ( ...argument ) [ REPEATABLE ( seed ) ]</o>

    [ LATERAL ] ( select ) [ [ AS ] alias [ ( ...column_alias ) ] ]
    with_query_name [ [ AS ] alias [ ( ...column_alias ) ] ]

    [ LATERAL ] function_name ( [ ...argument ] )
                [ WITH ORDINALITY ] [ [ AS ] alias [ ( ...column_alias ) ] ]

    [ LATERAL ] function_name ( [ ...argument ] ) <o>AS</o> ] alias ( ...column_definition )

    [ LATERAL ] function_name ( [ ...argument ] ) AS ( ...column_definition )

    [ LATERAL ] ROWS FROM( function_name ( [ ...argument ] ) [ AS ( ...column_definition ) ] [, ...] )
                [ WITH ORDINALITY ] [ [ AS ] alias [ ( ...column_alias ) ] ]
    from_item ::join_type:: from_item { ON join_condition | USING ( ...join_column ) [ AS join_using_alias ] }
    from_item NATURAL join_type from_item
    from_item CROSS JOIN from_item
]


[ WHERE condition ]
[ GROUP BY [ ALL | DISTINCT ] ...grouping_element ]

    ( )
    expression
    ( ...expression )
    ROLLUP ( { expression | ( ...expression ) } [, ...] )
    CUBE ( { expression | ( ...expression ) } [, ...] )
    GROUPING SETS ( ...grouping_element )

[ HAVING condition ]
[ WINDOW window_name AS ( window_definition ) [, ...] ]
[ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
[ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
[ LIMIT { count | ALL } ]
[ OFFSET start [ ROW | ROWS ] ]
[ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } { ONLY | WITH TIES } ]
[ FOR { UPDATE | NO KEY UPDATE | SHARE | KEY SHARE } [ OF ...table_name ] [ NOWAIT | SKIP LOCKED ] [...] ]
```
