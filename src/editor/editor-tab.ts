import { TurtleEditor } from "src/main";
import { Tab } from "../tab";
import { ShowConfirm } from "src/utils/dialog";
import { Localized } from "src/legacy";
declare const { GalapagosEditor }: any;
type GalapagosEditor = any;

/** EditorTab: A tab for the code editor. */
export class EditorTab extends Tab {
    // #region "Foundational Interfaces"
	/** Galapagos: Refers to the main editor.  */
	public readonly Galapagos: GalapagosEditor;
	/** Show: Show the editor tab.  */
    public Show() {
        super.Show();
		if (this.CodeRefreshed) this.Galapagos.SetCursorPosition(0);
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
	/** Constructor: Initialize the editor. */
	constructor(Container: HTMLElement, Editor: TurtleEditor) {
        super(Container, Editor);
        this.TipsElement = $(Container).children(".codemirror-tips");
		this.Galapagos = new GalapagosEditor($(Container).children(".codemirror").get(0)!, {
			Wrapping: true,
			OnUpdate: (Changed, Update) => {
				if (Changed && !this.IgnoreUpdate) {
					this.Editor.Call({ Type: "CodeChanged" });
				}
			},
			OnDictionaryClick: (Text) => this.Editor.CommandTab.ExplainFull(Text)
		});
	}
    // #endregion

    // #region "Interface Support"
    /** TipsElement: The HTML element for tips. */
    private TipsElement: JQuery<HTMLElement>;
	// Show the tips
	public ShowTips(Content, Callback?) {
		if (!Callback) Callback = () => { this.HideTips(); };
		this.TipsElement.off("click").text(Content).on("click", Callback).show();
	}
	// Hide the tips
	public HideTips() {
		this.TipsElement.hide();
	}
	/** SetCompilerErrors: Show the compiler error linting messages. */
	public SetCompilerErrors(Errors) {
		if (Errors.length == 0) this.HideTips();
		/** Temp hack: the Galapagos does not support unknown position errors yet. */
		if (Errors.length > 0 && Errors[0].start == 2147483647) {
			this.ShowTips(Errors[0].message);
			this.Galapagos.SetCompilerErrors([]);
		} else {
			if (Errors.length > 0) {
				this.Galapagos.SetCursorPosition(Errors[0].start);
			}
			this.Galapagos.SetCompilerErrors(Errors);
		}
	}
	/** SetRuntimeErrors: Show the runtime error linting messages. */
	public SetRuntimeErrors(Errors) {
		if (Errors.length > 0 && Errors[0].start == 2147483647) {
			this.ShowTips(Errors[0].message);
			this.Galapagos.SetRuntimeErrors([]);
		}else {
			if (Errors.length > 0) {
				this.Galapagos.SetCursorPosition(Errors[0].start);
			}
			this.Galapagos.SetRuntimeErrors(Errors);
		}
	}
	private IgnoreUpdate = false;
	/** CodeRefreshed: Did we refresh the code on the background? */
	private CodeRefreshed = false;
	/** SetCode: Set the content of the this. */
	public SetCode(Content, Unapplied) {
		// Set the content
		if (Content != this.Galapagos.GetCode()) {
			this.IgnoreUpdate = true;
			this.SetCompilerErrors([]);
			this.Galapagos.ClearHistory();
			this.Galapagos.SetCode(Content);
			if (!this.Visible) this.CodeRefreshed = true;
			this.Galapagos.SetCursorPosition(0);
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
		this.SetCompilerErrors([]);
	}
	// #endregion

	// #region "Editor Functionalities"
	/** JumpToNetTango: Jump to the NetTango portion. */
	public JumpToNetTango() {
		var Index = this.GetCode().indexOf("; --- NETTANGO BEGIN ---");
		if (Index == -1) return;
		this.Galapagos.SetCursorPosition(Index);
	}
	/** Reset: Show the reset dialog. */
	public Reset() {
		ShowConfirm("重置代码", "是否将代码重置到最后一次成功编译的状态？",
		    () => this.Editor.Call({ Type: "CodeReset" }));
	}
	/** ShowMenu: Show a feature menu. */
	public ShowMenu() {
		var Dialog = $("#Dialog-Procedures")
		var List = Dialog.children("ul").empty();
		Dialog.children("h4").text(Localized.Get("更多功能"));
		var Features = {};
		Features[Localized.Get("选择全部")] = () => this.Galapagos.SelectAll();
		Features[Localized.Get("撤销操作")] = () => this.Galapagos.Undo();
		Features[Localized.Get("重做操作")] = () => this.Galapagos.Redo();
		Features[Localized.Get("跳转到行")] = () => this.Galapagos.ShowJumpTo();
		Features[Localized.Get("整理代码")] = () => this.Galapagos.PrettifyAll();
		Features[Localized.Get("重置代码")] = () => this.Reset();
		for (var Feature in Features) {
			$(`<li>${Feature}</li>`).attr("Tag", Feature).appendTo(List).click(function() {
				Features[$(this).attr("Tag")]();
				($ as any).modal.close();
			});
		}
		(Dialog as any).modal({});
	}
	/** ShowProcedures: List all procedures in the code. */
	public ShowProcedures = function() {
		var Procedures = this.GetProcedures();
		if (Object.keys(Procedures).length == 0) {
			this.Toast("warning", Localized.Get("代码中还没有任何子程序。"));
		} else {
			var Dialog = $("#Dialog-Procedures")
			var List = Dialog.children("ul").empty();
			Dialog.children("h4").text(Localized.Get("跳转到子程序"));
			var Handler = function() {
				this.Galapagos.Select($(this).attr("start"), $(this).attr("end"));
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
	public GetProcedures = function() {
		var Rule = /^\s*(?:to|to-report)\s(?:\s*;.*\n)*\s*(\w\S*)/gm // From NLW
		var Content = this.GetCode(); 
        var Names = [];
        var Match: RegExpExecArray;
		while (Match = Rule.exec(Content)) {
			var Length = Match.index + Match[0].length;
			Names[Match[1]] = [ Length - Match[1].length, Length ];
		}
		return Names;
	}
    // #endregion
}