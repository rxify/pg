import { CommandType, StmtType } from './document.js';
import { PgSyntaxError } from './error.js';
import { Project } from './project.js';
import { now } from './time.js';
import { validateTableStmt } from './validators/validate-table.js';
import { validateViewStmt } from './validators/validate-view.js';

export function validate(project: Project) {
    const errors: PgSyntaxError[] = [];

    const createStmts = project.commands[CommandType.CREATE];
    const tables = createStmts[StmtType.TABLE];
    const views = createStmts[StmtType.VIEW];

    const tablesArr = Object.values(tables);
    const viewsArr = Object.values(views);

    tablesArr.forEach((stmt) => {
        errors.push(
            ...validateTableStmt(stmt, tables, project.sourceMap[stmt.path])
        );
    });

    viewsArr.forEach((view) =>
        errors.push(
            ...validateViewStmt(
                view,
                views,
                tables,
                project.sourceMap[view.position]
            )
        )
    );
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
