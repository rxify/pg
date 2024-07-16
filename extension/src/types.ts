import * as vscode from 'vscode';
import { isTruthy as _isTruthy } from './truthy';

export const isTruthy = _isTruthy;

export declare type ExecDoc = {
    uri: vscode.Uri;
    cursors: boolean;
};

export const isExecDoc = (val: any): val is ExecDoc =>
    isTruthy(val) &&
    typeof val === 'object' &&
    'uri' in val &&
    'cursors' in val;

export declare type ExecStmt = {
    stmt: string;
    cursors: boolean;
    description?: string;
};

export declare type LensPoint<T> = {
    startLine: number;
    title: string;
    command: string;
    arg: T;
};
