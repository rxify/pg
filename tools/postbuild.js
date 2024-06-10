import { cpSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const conf = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'));
delete conf.devDependencies;
delete conf.scripts;

writeFileSync(resolve('dist/package.json'), JSON.stringify(conf, null, 4));
cpSync(resolve('README.md'), resolve('dist', 'README.md'));
