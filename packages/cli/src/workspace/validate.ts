import { CommandType, StmtType } from './document.js';
import { PgSyntaxError } from './error.js';
import { TokenType } from './grammar/pg-tokenizer.js';
import { olen } from './parsers/util.js';
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

    viewsArr.forEach((view) => {
        if (olen(view.parsed.referencesByColumn) === 1) {
            const { value } = view.parsed.referencesByColumn[0];
            if (value === '*') {
                const { ref } = view.parsed.aliases[0];
                if (!ref) throw '';
                if (!tables[ref.value]) throw '';
                const columns = tables[ref.value].parsed.columns.map((col) => {
                    return {
                        position: ref.position,
                        type: TokenType.COLUMN,
                        value: col.colname
                    };
                });
                view.parsed.referencesByColumn = columns;
                view.parsed.referencesByColumn = columns;
            }
        }
    });

    viewsArr.forEach((view) =>
        errors.push(
            ...validateViewStmt(
                view,
                views,
                tables,
                project.sourceMap[view.path]
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
