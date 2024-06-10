import { readFileSync, writeFileSync } from 'fs';

const conf = JSON.parse(readFileSync('../package.json', 'utf-8'));
delete conf.devDependencies;
delete conf.scripts;

writeFileSync('../dist/package.json', JSON.stringify(conf, null, 4));
