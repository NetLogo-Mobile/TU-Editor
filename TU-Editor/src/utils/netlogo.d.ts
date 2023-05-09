/// <reference types="jquery" />
/// <reference types="jquery" />
import { GalapagosEditor } from "../../../CodeMirror-NetLogo/src/editor";
import { CodeSnapshot } from "../../../CodeMirror-NetLogo/src/lang/services/code-snapshot";
/** NetLogoUtils: Utilities for the NetLogo language. */
export declare class NetLogoUtils {
    /** SharedEditor: The shared editor. */
    static SharedEditor: GalapagosEditor;
    /** AnnotateCodes: Annotate some code elements. */
    static AnnotateCodes(Targets: JQuery<HTMLElement>): void;
    /** AnnotateCode: Annotate a code element. */
    static AnnotateCode(Target: JQuery<HTMLElement>, Content?: string): void;
    /** HighlightCode: Highlight a code snippet. */
    static HighlightCode(Content: string): HTMLElement;
    /** BuildSnapshot: Build a code snapshot. */
    static BuildSnapshot(Content?: string): CodeSnapshot | undefined;
    /** FixGeneratedCode: Fix some generated code. */
    static FixGeneratedCode(Content: string, Parent?: CodeSnapshot): string;
    /** PostprocessLintMessage: Postprocess a lint message. */
    static PostprocessLintMessage(Message: string): string;
}
