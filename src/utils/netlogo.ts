import { GalapagosEditor } from "../../../CodeMirror-NetLogo/src/editor";
import { CodeSnapshot } from "../../../CodeMirror-NetLogo/src/lang/services/code-snapshot";

/** NetLogoUtils: Utilities for the NetLogo language. */
export class NetLogoUtils {
	/** SharedEditor: The shared editor. */
	public static SharedEditor: GalapagosEditor;
	/** AnnotateCodes: Annotate some code elements. */
	public static AnnotateCodes(Targets: JQuery<HTMLElement>) {
        Targets.each(function() {
            NetLogoUtils.AnnotateCode($(this));
        });
	}
	/** AnnotateCode: Annotate a code element. */
	public static AnnotateCode(Target: JQuery<HTMLElement>, Content?: string) {
        Content = Content ? Content : Target.text();
        Target.empty().append($(NetLogoUtils.HighlightCode(Content)));
	}
	/** HighlightCode: Highlight a code snippet. */
	public static HighlightCode(Content: string): HTMLElement {
        this.SharedEditor.SetCode(Content);
        this.SharedEditor.Semantics.PrettifyAll();
        console.log(this.SharedEditor.GetCode());
        return this.SharedEditor.Semantics.Highlight();
	}
	/** BuildSnapshot: Build a code snapshot. */
	public static BuildSnapshot(Content?: string): CodeSnapshot | undefined {
		if (!Content) return undefined;
		this.SharedEditor.SetCode(Content);
		return this.SharedEditor.Semantics.BuildSnapshot();
	}
	/** FixGeneratedCode: Fix some generated code. */
	public static FixGeneratedCode(Content: string, Parent?: CodeSnapshot): string {
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
}