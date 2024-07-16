const { readFileSync } = require('fs');

const file = readFileSync('syntaxes/pg-runner.tmGrammar.json');
const parsed = JSON.parse(file);

const getKey = (obj, searchVal) => {
    const vals = [];

    if (typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
            if (key === searchVal) {
                vals.push(obj[key]);
            }

            vals.push(...getKey(obj[key], searchVal));
        });
    }

    return vals;
};

console.log(getKey(parsed, 'match'));
