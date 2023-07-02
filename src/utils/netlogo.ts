import { GalapagosEditor } from "../../../CodeMirror-NetLogo/src/editor";
import { RuntimeError } from "../../../CodeMirror-NetLogo/src/lang/linters/runtime-linter";
import { CodeSnapshot } from "../../../CodeMirror-NetLogo/src/lang/services/code-snapshot";
import { Diagnostic } from "../chat/client/languages/netlogo-context";

/** NetLogoUtils: Utilities for the NetLogo language. */
export class NetLogoUtils {
	/** SharedEditor: The shared editor. */
	public static SharedEditor: GalapagosEditor;
	/** AnnotateCodes: Annotate some code elements. */
	public static AnnotateCodes(Targets: JQuery<HTMLElement>, Prettify: boolean = true) {
        Targets.each(function() {
            NetLogoUtils.AnnotateCode($(this), undefined, Prettify);
        });
	}
	/** AnnotateCode: Annotate a code element. */
	public static AnnotateCode(Target: JQuery<HTMLElement>, Content?: string, Prettify: boolean = true): string {
        Content = Content ? Content : Target.text();
		var [Element, Code] = NetLogoUtils.HighlightCode(Content);
        Target.empty().append($(Element)).data("code", Code);
		return Code;
	}
	/** HighlightCode: Highlight a code snippet. */
	public static HighlightCode(Content: string, Prettify: boolean = true): [HTMLElement, string] {
        this.SharedEditor.SetCode(Content.trim());
		// Prettify it if it contains a newline
		if (Prettify && Content.indexOf("\n") !== -1) {
        	this.SharedEditor.Semantics.PrettifyAll();
			Content = this.SharedEditor.GetCode().trim();
       		this.SharedEditor.SetCode(Content);
		}
		// Highlight it
        var Element = this.SharedEditor.Semantics.Highlight();
		return [Element, Content];
	}
	/** BuildSnapshot: Build a code snapshot. */
	public static BuildSnapshot(Content?: string): CodeSnapshot | undefined {
		if (!Content) return undefined;
		this.SharedEditor.SetCode(Content);
		return this.SharedEditor.Semantics.BuildSnapshot();
	}
	/** FixGeneratedCode: Fix some generated code. */
	public static FixGeneratedCode(Content: string, Parent?: CodeSnapshot): string {
		if (Content.startsWith("NetLogo\n"))
			Content = Content.substring(8);
		// Remove the trailing semicolon
		if (Content.endsWith(';')) Content = Content.slice(0, -1);
		// Remove the ```
		if (Content.startsWith("```")) Content = Content.slice(3);
		if (Content.indexOf("```") != -1) Content = Content.slice(0, Content.indexOf("```"));
		// Replace back to "
		Content = Content.replace(/`/g, '"').replace(/'/g, '"');
		return this.SharedEditor.Semantics.FixGeneratedCode(Content, Parent);
	}
	/** PostprocessLintMessage: Postprocess a lint message. */
	public static PostprocessLintMessage(Message: string): string {
		return Message;
	}
	/** ErrorToDiagnostic: Convert a runtime error to a diagnostic. */
	public static ErrorToDiagnostic(Error: RuntimeError): Diagnostic {
		return {
			Message: Error.message,
			Code: Error.code!,
		};
	}
	/** ErrorsToDiagnostics: Convert runtime errors to diagnostics. */
	public static ErrorsToDiagnostics(Errors: RuntimeError[]): Diagnostic[] {
		return Errors.map(this.ErrorToDiagnostic);
	}
	/** GetUniqueDiagnostics: Get the unique diagnostics. */
	public static GetUniqueDiagnostics(Diagnostics: Diagnostic[]): Diagnostic[] {
		var Results = new Map<string, Diagnostic>();
		for (var I = 0; I < Diagnostics.length; I++)
			Results.set(Diagnostics[I].Code + "|" + Diagnostics[I].Message, Diagnostics[I]);
		return Array.from(Results.values());
	}
}