import { TurtleEditor } from "../main";
import { Tab } from "../tab";
import { ShowConfirm, Toast } from "../utils/dialog";
import { GalapagosEditor, Localized } from "../../../CodeMirror-NetLogo/src/editor";
import { NetLogoUtils } from "../utils/netlogo";

/** EditorTab: A tab for the code editor. */
export class EditorTab extends Tab {
    // #region "Foundational Interfaces"
	/** Galapagos: Refers to the main editor.  */
	public readonly Galapagos: GalapagosEditor;
	/** Show: Show the editor tab.  */
    public Show() {
		if (!this.Visible) TurtleEditor.Call({ Type: "TabSwitched", Tab: "$Editor$" });
        super.Show();
		if (this.CodeRefreshed) {
			this.Galapagos.Selection.SetCursorPosition(0);
			this.CodeRefreshed = false;
		}
    }
	/** Hide: Hide the editor tab.  */
    public Hide() {
        super.Hide();
    }
    /** Blur: Blur the tab's editor. */
    public Blur() {
        super.Blur();
        this.Galapagos.Blur();
    }
	/** Resize: Resize the tab. */
	private TimeoutHandler: any;
	public Resize(ViewportHeight: number, ScrollHeight: number) {
		super.Resize(ViewportHeight, ScrollHeight);
		this.Galapagos.CodeMirror.requestMeasure();
		this.Galapagos.Selection.RefreshCursor();
		return true;
	}
	/** Constructor: Initialize the editor. */
	constructor(Container: HTMLElement, Editor: TurtleEditor) {
        super(Container, Editor);
        this.TipsElement = $(Container).children(".codemirror-tips");
		this.Galapagos = new GalapagosEditor($(Container).children(".codemirror").get(0)!, {
			Wrapping: true,
			OnUpdate: (Changed: boolean, Update: any) => {
				if (Changed && !this.IgnoreUpdate)
					TurtleEditor.Call({ Type: "CodeChanged" });
			},
			OnDictionaryClick: (Text: string) => this.Editor.CommandTab.ExplainPrimitive(Text),
			OnExplain: (Diagnostic, Context) => this.Editor.CommandTab.ExplainDiagnostic({
				Message: NetLogoUtils.PostprocessLintMessage(Diagnostic.message),
				Code: this.Galapagos.GetCodeSlice(Diagnostic.from, Diagnostic.to)
			}, Context, true)
		});
	}
    // #endregion

    // #region "Interface Support"
    /** TipsElement: The HTML element for tips. */
    private TipsElement: JQuery<HTMLElement>;
	// Show the tips
	public ShowTips(Content: string, Callback?: () => void) {
		if (!Callback) Callback = () => this.HideTips();
		this.TipsElement.off("click").text(Content).on("click", Callback).show();
	}
	// Hide the tips
	public HideTips() {
		this.TipsElement.hide();
	}
	private IgnoreUpdate = false;
	/** CodeRefreshed: Did we refresh the code on the background? */
	private CodeRefreshed = false;
	/** SetCode: Set the content of the this. */
	public SetCode(Content: string, Unapplied: boolean) {
		// Set the content
		if (Content != this.Galapagos.GetCode()) {
			this.IgnoreUpdate = true;
			this.Galapagos.SetCode(Content);
			this.Galapagos.UpdateContext();
			if (!this.Visible) this.CodeRefreshed = true;
			this.Galapagos.Selection.SetCursorPosition(0);
			this.HideTips();
			this.IgnoreUpdate = false;
		}
		// Mark clean or show tips
		if (!Unapplied) this.SetApplied();
	}
	/** GetCode: Get the content of the this. */
	public GetCode() {
		return this.Galapagos.GetCode();
	}
	/** SetApplied: Set applied status. */
	public SetApplied() {
		this.Galapagos.SetCompilerErrors([]);
	}
	// #endregion

	// #region "Editor Functionalities"
	/** JumpToNetTango: Jump to the NetTango portion. */
	public JumpToNetTango() {
		var Index = this.GetCode().indexOf("; --- NETTANGO BEGIN ---");
		if (Index == -1) return;
		this.Galapagos.Selection.SetCursorPosition(Index);
	}
	/** ResetCode: Show the reset dialog. */
	public ResetCode() {
		ShowConfirm("ResetCode", "Do you want to reset the code",
		    () => TurtleEditor.Call({ Type: "CodeReset" }));
	}
	/** ShowMenu: Show a feature menu. */
	public ShowMenu() {
		var Dialog = $("#Dialog-Procedures")
		var List = Dialog.children("ul").empty();
		Dialog.children("h4").text(Localized.Get("MoreFeatures"));
		var Features: Record<string, () => void> = {};
		Features[Localized.Get("SelectAll")] = () => this.Galapagos.Selection.SelectAll();
		Features[Localized.Get("Undo")] = () => this.Galapagos.Editing.Undo();
		Features[Localized.Get("Redo")] = () => this.Galapagos.Editing.Redo();
		Features[Localized.Get("JumpToLine")] = () => this.Galapagos.Editing.ShowJumpTo();
		Features[Localized.Get("Prettify")] = () => {
			// var Before = this.Galapagos.GetCode();
			this.Galapagos.Semantics.PrettifyOrAll();
			// this.Galapagos.Selection.HighlightChanges(Before);
		};
		Features[Localized.Get("ResetCode")] = () => this.ResetCode();
		for (var Feature in Features) {
			$(`<li>${Feature}</li>`).attr("Tag", Feature).appendTo(List).click(function() {
				Features[$(this).attr("Tag")!]();
				($ as any).modal.close();
			});
		}
		(Dialog as any).modal({});
	}
	/** ShowProcedures: List all procedures in the code. */
	public ShowProcedures() {
		var Procedures = this.GetProcedures();
		if (Object.keys(Procedures).length == 0) {
			Toast("warning", Localized.Get("There is no procedure"));
		} else {
			var Dialog = $("#Dialog-Procedures")
			var List = Dialog.children("ul").empty();
			var Galapagos = this.Galapagos;
			Dialog.children("h4").text(Localized.Get("JumpToProcedure"));
			for (var Procedure in Procedures) {
				$(`<li>${Procedure}</li>`).appendTo(List)
					.attr("start", Procedures[Procedure][0])
					.attr("end", Procedures[Procedure][1]).on("click", function() {
						Galapagos.Selection.Select(parseInt($(this).attr("start")!), parseInt($(this).attr("end")!));
						($ as any).modal.close();
					});
			}
            (Dialog as any).modal({});
		}
	}
	/** GetProcedures: Get all procedures from the code. */
	public GetProcedures() {
		var Rule = /^\s*(?:to|to-report)\s(?:\s*;.*\n)*\s*(\w\S*)/gm // From NLW
		var Content = this.GetCode(); 
        var Names: Record<string, [number, number]> = {};
        var Match: RegExpExecArray | null;
		while (Match = Rule.exec(Content)) {
			var Length = Match.index + Match[0].length;
			Names[Match[1]] = [ Length - Match[1].length, Length ];
		}
		return Names;
	}
    // #endregion
}