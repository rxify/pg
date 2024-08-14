import { CommandType, StmtType } from './document.js';
import { PgSyntaxError } from './error.js';
import { Project } from './project.js';
import { now } from './time.js';
import { validateTableStmt } from './validators/validate-table.js';

export function validate(project: Project) {
    const errors: PgSyntaxError[] = [];

    const createStmts = project.commands[CommandType.CREATE];
    const tables = createStmts[StmtType.TABLE];
    const tablesArr = Object.values(tables);

    tablesArr.forEach((stmt) => {
        errors.push(
            ...validateTableStmt(stmt, tables, project.sourceMap[stmt.path])
        );
    });

    return errors;
}

export function formatErrors(errors: PgSyntaxError[], inWatchMode?: boolean) {
    if (errors.length > 0) {
        errors.forEach((error) => {
            console.error(error.prettyPrint());
        });
    }

    console.log(
        `${now()} Found ${errors.length} errors.${
            inWatchMode ? ' Watching for file changes.' : ''
        }`
    );
}
