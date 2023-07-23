import { EditorView } from '@codemirror/view';
import { StateNetLogo } from '../../codemirror/extension-state-netlogo';
import { EditorState } from '@codemirror/state';
import { SyntaxNode, SyntaxNodeRef } from '@lezer/common';
import { LintContext, PreprocessContext } from '../classes/contexts';
import { Diagnostic } from '@codemirror/lint';
/** CheckContext: The context of the current check. */
export interface CheckContext {
    state: EditorState;
    preprocessState: PreprocessContext;
    parseState: LintContext;
    breedNames: string[];
    breedVars: string[];
}
export declare const getCheckContext: (view: EditorView, lintContext: LintContext, preprocessContext: PreprocessContext) => CheckContext;
export declare const acceptableIdentifiers: string[];
export declare const checkValidIdentifier: (Node: SyntaxNode, value: string, context: CheckContext) => boolean;
export declare const getLocalVariables: (Node: SyntaxNode, State: EditorState, parseState: LintContext | StateNetLogo) => string[];
/** checkUndefinedBreed: Check if the breed-like primitive is undefined and provide lint messages accordingly. */
export declare function checkUndefinedBreed(diagnostics: Diagnostic[], context: PreprocessContext, view: EditorView, noderef: SyntaxNode): boolean;
/** UnrecognizedSuggestions: Suggestions for unrecognized identifiers. */
export declare const UnrecognizedSuggestions: Record<string, string>;
/** checkUnrecognizedWithSuggestions: Check if the unrecognized identifier has a suggestion. */
export declare function checkUnrecognizedWithSuggestions(diagnostics: Diagnostic[], view: EditorView, node: SyntaxNode | SyntaxNodeRef): boolean;
