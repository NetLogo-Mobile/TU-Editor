import { TurtleEditor } from "../main";
import { Tab } from "../tab";
import { ShowConfirm } from "../utils/dialog";
import { Localized } from "../legacy";
import { GalapagosEditor } from "../../../CodeMirror-NetLogo/src/editor";

/** EditorTab: A tab for the code editor. */
export class EditorTab extends Tab {
    // #region "Foundational Interfaces"
	/** Galapagos: Refers to the main editor.  */
	public readonly Galapagos: GalapagosEditor;
	/** Show: Show the editor tab.  */
    public Show() {
		if (!this.Visible) this.Editor.Call({ Type: "TabSwitched", Tab: "$Editor$" });
        super.Show();
		if (this.CodeRefreshed) this.Galapagos.Selection.SetCursorPosition(0);
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
					this.Editor.Call({ Type: "CodeChanged" });
			},
			OnDictionaryClick: (Text: string) => this.Editor.CommandTab.ExplainFull(Text)
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
			this.Galapagos.SetCompilerErrors([]);
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
		ShowConfirm("重置代码", "是否将代码重置到最后一次成功编译的状态？",
		    () => this.Editor.Call({ Type: "CodeReset" }));
	}
	/** ShowMenu: Show a feature menu. */
	public ShowMenu() {
		var Dialog = $("#Dialog-Procedures")
		var List = Dialog.children("ul").empty();
		Dialog.children("h4").text(Localized.Get("更多功能"));
		var Features: Record<string, () => void> = {};
		Features[Localized.Get("选择全部")] = () => this.Galapagos.Selection.SelectAll();
		Features[Localized.Get("撤销操作")] = () => this.Galapagos.Editing.Undo();
		Features[Localized.Get("重做操作")] = () => this.Galapagos.Editing.Redo();
		Features[Localized.Get("跳转到行")] = () => this.Galapagos.Editing.ShowJumpTo();
		Features[Localized.Get("整理代码")] = () => this.Galapagos.Semantics.PrettifyOrAll();
		Features[Localized.Get("重置代码")] = () => this.ResetCode();
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
			this.Editor.Toast("warning", Localized.Get("代码中还没有任何子程序。"));
		} else {
			var Dialog = $("#Dialog-Procedures")
			var List = Dialog.children("ul").empty();
			Dialog.children("h4").text(Localized.Get("跳转到子程序"));
			var Handler = () => {
				this.Galapagos.Selection.Select(parseInt($(this).attr("start")!), parseInt($(this).attr("end")!));
				($ as any).modal.close();
			};
			for (var Procedure in Procedures) {
				$(`<li>${Procedure}</li>`).appendTo(List)
					.attr("start", Procedures[Procedure][0])
					.attr("end", Procedures[Procedure][1]).click(Handler);
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