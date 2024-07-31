import { parse } from 'pgsql-parser';
// @todo - this is breaking the compiler - import escapeString from 'escape-sql-string';
import vscode from 'vscode';

export declare type ExecBase = {
    /** The line where a command will display in the active text editor */
    startLn: number;
    /** The name of a command in the active text editor */
    title: string;
    /** The command, registered in package.json#contributes#commands */
    command: string;
};

/**
 * Defines the structure of commands to execute a selection
 * of a local sql file.
 */
export declare type ExecStmt = ExecBase & {
    /** A SQL statement to execute */
    stmt: string;
    /** Whether the stmt returns cursors */
    cursors: boolean;
    /** @deprecated */
    description?: string;
};

/**
 * Defines the structure of commands to execute an entire
 * local sql file.
 */
export declare type ExecDoc = ExecBase & {
    /** The uri of a local SQL file */
    uri: vscode.Uri;
};

/**
 * Safely assert that val is an ExecDoc.
 */
export const isExecDoc = (val: any): val is ExecDoc => {
    return (
        val !== undefined &&
        val !== null &&
        typeof val === 'object' &&
        'uri' in val
    );
};

declare type PgsqlParserStmt = {
    RawStmt: {
        stmt: any;
        stmt_len: number;
        stmt_location: number;
    };
};

export class SqlCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        try {
            return this._parseDocument(document);
        } catch (e) {
            console.error(
                'Something went wrong when parsing the current document.'
            );
            console.error(e);
            return [];
        }
    }

    private _parseDocument(document: vscode.TextDocument) {
        const text = document.getText();
        const lines = text.split(/\n/g);

        const lenses: vscode.CodeLens[] = [
            this._createCodeLens({
                startLn: 0,
                title: 'Run All',
                command: 'extension.runSql',
                cursors: false,
                uri: document.uri
            })
        ];

        try {
            const commands: PgsqlParserStmt[] = parse(text);
            const stmts = commands
                .map((command) => ({
                    text: text.substring(command.RawStmt.stmt_location).trim(),
                    stmt_len: command.RawStmt.stmt_len,
                    stmt_location: command.RawStmt.stmt_location
                }))
                .map((stmt) => {
                    const startLn =
                        lines.findIndex((ln) => ln === stmt.text) + 1;
                    return this._createCodeLens({
                        startLn,
                        title: 'Run',
                        command: 'extension.runSql',
                        cursors: stmt.text.includes('refcursor'),
                        // @todo - reintroduce escapeString(stmt.text)
                        stmt: stmt.text
                    });
                });
            lenses.push(...stmts);
        } catch (e) {
            console.error('Something went wrong when parsing the document.');
            console.error(e);
        }

        return lenses;
    }

    /**
     * Creates a new CodeLens
     * @param options object of type {@link ExecDoc} or {@link ExecStmt}
     * @returns An initialized CodeLens object
     */
    private _createCodeLens(options: ExecDoc | ExecStmt) {
        const { title, command, startLn } = options;

        const cmd: vscode.Command = {
            title,
            command,
            arguments: [options]
        };

        return new vscode.CodeLens(
            new vscode.Range(startLn, 0, startLn, 0),
            cmd
        );
    }
}

export const provideCodeLens = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { language: 'sql', scheme: 'file' },
            new SqlCodeLensProvider()
        )
    );
};
