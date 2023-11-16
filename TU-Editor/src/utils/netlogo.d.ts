/// <reference types="jquery" />
/// <reference types="jquery" />
import { GalapagosEditor } from "../../../CodeMirror-NetLogo/src/editor";
import { RuntimeError } from "../../../CodeMirror-NetLogo/src/lang/linters/runtime-linter";
import { CodeSnapshot } from "../../../CodeMirror-NetLogo/src/lang/services/code-snapshot";
import { Diagnostic } from "../chat/client/languages/netlogo-context";
/** NetLogoUtils: Utilities for the NetLogo language. */
export declare class NetLogoUtils {
    /** SharedEditor: The shared editor. */
    static SharedEditor: GalapagosEditor;
    /** AnnotateCodes: Annotate some code elements. */
    static AnnotateCodes(Targets: JQuery<HTMLElement>, Prettify?: boolean): void;
    /** AnnotateCode: Annotate a code element. */
    static AnnotateCode(Target: JQuery<HTMLElement>, Content?: string, Language?: string, Prettify?: boolean): string;
    /** HighlightCode: Highlight a code snippet. */
    static HighlightCode(Content: string, Language?: string, Prettify?: boolean): [HTMLElement | Text, string];
    /** BuildSnapshot: Build a code snapshot. */
    static BuildSnapshot(Content?: string): CodeSnapshot | undefined;
    /** FixGeneratedCode: Fix some generated code. */
    static FixGeneratedCode(Content: string, Parent?: CodeSnapshot): Promise<string>;
    /** PostprocessLintMessage: Postprocess a lint message. */
    static PostprocessLintMessage(Message: string): string;
    /** ErrorToDiagnostic: Convert a runtime error to a diagnostic. */
    static ErrorToDiagnostic(Error: RuntimeError): Diagnostic;
    /** ErrorsToDiagnostics: Convert runtime errors to diagnostics. */
    static ErrorsToDiagnostics(Errors: RuntimeError[]): Diagnostic[];
    /** GetUniqueDiagnostics: Get the unique diagnostics. */
    static GetUniqueDiagnostics(Diagnostics: Diagnostic[]): Diagnostic[];
}
