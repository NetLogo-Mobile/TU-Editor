import { GalapagosEditor } from "../../../CodeMirror-NetLogo/src/editor";

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
        this.SharedEditor.ForceParse();
        return this.SharedEditor.Semantics.Highlight();
	}
}