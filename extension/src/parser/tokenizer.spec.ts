import { Token, Tokenizer } from './tokenizer';

describe('TD parser tokenizer', () => {
    test('Can tokenize one-line script', () => {
        const script = `SELECT * FROM my_table.myfunction()`;

        const tokenizer = new Tokenizer(script, './src/my-function.sql');
        const tokens = [...tokenizer.tokens];

        // const [select, all, from, mytable, myfunction] = ['SELECT'.length,
        //     '*'.length,
        //     'FROM'.length,
        //     'my_table'.length,
        //     'my_function'.length];

        const expected: Token[] = [
            {
                position: 0,
                type: 'keyword',
                value: 'SELECT'
            },
            {
                position: 7,
                type: 'keyword',
                value: '*'
            },
            {
                position: 9,
                type: 'keyword',
                value: 'FROM'
            },
            {
                position: 14,
                type: 'string',
                value: 'my_table'
            },
            {
                position: 22,
                type: 'punctuation',
                value: '.'
            },
            {
                position: 23,
                type: 'string',
                value: 'myFunction'
            },
            {
                position: 33,
                type: 'open',
                value: '('
            },
            {
                position: 34,
                type: 'close',
                value: ')'
            }
        ];

        expect(tokens).toEqual(expected);
    });
});
