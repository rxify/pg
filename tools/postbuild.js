import { execSync } from 'child_process';
import { cpSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const conf = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'));
delete conf.devDependencies;
delete conf.scripts;
delete conf.workspaces;
conf.bin['pg-runner'] = 'cli/bin.js';

writeFileSync(resolve('dist/package.json'), JSON.stringify(conf, null, 4));
cpSync(resolve('README.md'), resolve('dist', 'README.md'));
execSync('chmod 755 dist/cli/bin.js');
