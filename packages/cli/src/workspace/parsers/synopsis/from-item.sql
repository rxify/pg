-- from_item

[ONLY]
  table_name
  [*]
  [[AS] alias [( column_alias [, ...] )]]
    [TABLESAMPLE sampling_method ( argument [, ...] ) [REPEATABLE ( seed )]]
  
[LATERAL]
  ( select )
  [[AS] alias [( ...column_alias )]]
  
with_query_name
  [[AS] alias [( ...column_alias )]]
  
[LATERAL]
  function_name ( ..argument )
  [WITH ORDINALITY]
  [[AS] alias [( ...column_alias )]]
  
[LATERAL] function_name ( ...argument ) [AS] alias ( ...column_definition )
  
[LATERAL] function_name ( ...argument ) AS ( ...column_definition )
  
[LATERAL] ROWS FROM( function_name ( ...argument ) [AS ( ...column_definition )] [, ...] )
  [WITH ORDINALITY]
  [[AS] alias [( ...column_alias )]]
  
from_item
  join_type
  from_item
  { ON join_condition | USING ( join_column [, ...] ) [AS join_using_alias] }
  
from_item
  NATURAL
  join_type
  from_item
  
from_item
  CROSS JOIN
  from_item