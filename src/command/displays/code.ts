import { CommandTab } from "../command-tab";
import { Display } from "./display";
import { GalapagosEditor, Localized } from "../../../../CodeMirror-NetLogo/src/editor"
import { ParseMode } from "../../../../CodeMirror-NetLogo/src/editor-config";
import { NetLogoUtils } from "../../utils/netlogo";
import { ChatRecord } from "../../chat/client/chat-record";
import { ChatManager } from "../../chat/chat-manager";
import { ChatResponseOption } from "../../chat/client/chat-option";
import { SubthreadRenderer } from "../outputs/subthread-renderer";
import { RecordRenderer } from '../outputs/record-renderer';
import { ChatResponseSection, ChatResponseType } from "../../chat/client/chat-response";
import { Diagnostic, Procedure } from "../../chat/client/languages/netlogo-context";
import { ChangeTopic, FixCode } from '../../chat/client/options/option-templates';
import { RuntimeError } from "../../../../CodeMirror-NetLogo/src/lang/linters/runtime-linter";
import { TurtleEditor } from "../../main";

/** CodeDisplay: The interactive code editor section. */
export class CodeDisplay extends Display {
	// #region "Interfaces"
	/** Editor: The editor instance. */
	public Editor: GalapagosEditor;
	/** Instance: The singleton instance. */
	public static Instance: CodeDisplay;
	/** PlayButton: The play button of the display. */
	private PlayButton: JQuery<HTMLElement>;
	/** FixButton: The fix button of the display. */
	// private FixButton: JQuery<HTMLElement>;
	/** AskButton: The ask button of the display. */
	private AskButton: JQuery<HTMLElement>;
	/** AddToCodeButton: The add to code button of the display. */
	private AddToCodeButton: JQuery<HTMLElement>;
	/** Constructor: Create a new output section. */
	public constructor(Tab: CommandTab) {
		super(Tab, ".command-code"); 
		// Create the shared editor if necessary
		if (!NetLogoUtils.SharedEditor) {
			NetLogoUtils.SharedEditor = new GalapagosEditor(
				$(`<div class="hidden-editor"></div>`).appendTo(this.Container).get(0)!, {
				ParseMode: ParseMode.Generative
			});
			NetLogoUtils.SharedEditor.SetVisible(false);
			this.Tab.Editor.EditorTabs[0].Galapagos.AddChild(NetLogoUtils.SharedEditor);
		}
		// Create the editor
		this.Editor = new GalapagosEditor(
			$(`<div class="codemirror"></div>`).appendTo(this.Container).get(0)!, {
			Wrapping: true,
			ParseMode: ParseMode.Generative
		});
		this.Editor.SetVisible(false);
		this.Tab.Editor.EditorTabs[0].Galapagos.AddChild(this.Editor);
		// Create the toolbar
		var Toolbar = $(`<div class="toolbar"></div>`).appendTo(this.Container);
		this.PlayButton = $(`<div class="button run">${Localized.Get("RunCode")}</div>`).on("click", () => this.Play()).appendTo(Toolbar);
		// this.FixButton = $(`<div class="button fix">${Localized.Get("FixCode")}</div>`).on("click", () => this.Fix()).appendTo(Toolbar);
		this.AskButton = $(`<div class="button ask">${Localized.Get("AskCode")}</div>`).on("click", () => this.Ask()).appendTo(Toolbar);
		this.AddToCodeButton = $(`<div class="button addtocode">${Localized.Get("AddCode")}</div>`).hide().on("click", () => this.AddToCode()).appendTo(Toolbar);
		// Create the history
		var History = $(`<div class="history"></div>`).appendTo(Toolbar);
		this.PreviousButton = $(`<div class="button prev">${Localized.Get("PreviousVersion")}</div>`).on("click", () => this.ShowPrevious()).appendTo(History);
		this.HistoryDisplay = $(`<div class="label">0 / 0</div>`).appendTo(History);
		this.NextButton = $(`<div class="button next">${Localized.Get("NextVersion")}</div>`).on("click", () => this.ShowNext()).appendTo(History);
		CodeDisplay.Instance = this;
	}
    /** Show: Show the section. */
    public Show() {
		if (this.Visible) return;
		if (!this.Tab.Visible) this.Tab.Show();
		// Show the output tab as well
		this.Tab.Outputs.Show();
		this.Tab.Outputs.Container.addClass("code-enabled");
		// Show myself
        $(this.Container).show();
        this.Visible = true;
		this.Editor.SetVisible(true);
    }
	/** Hide: Hide the section. */
	public Hide() {
		if (!this.Visible) return;
        $(this.Container).hide();
		this.Tab.Outputs.Container.removeClass("code-enabled");
        this.Visible = false;
		this.Editor.SetVisible(false);
	}
	// #endregion

	// #region "History Operations"
	/** Subthread: The related subthread. */
	private Subthread?: SubthreadRenderer;
	/** Record: The related record. */
	private Record?: ChatRecord;
	/** Records: The records that contains code sections. */
	private Records: [ChatRecord, ChatResponseSection][] = [];
	/** CurrentIndex: The current code index of the display. */
	private CurrentIndex: number = 0;
	/** PreviousButton: The previous button of the display. */
	private PreviousButton: JQuery<HTMLElement>;
	/** NextButton: The next button of the display. */
	private NextButton: JQuery<HTMLElement>;
	/** HistoryDisplay: The label of the history. */
	private HistoryDisplay: JQuery<HTMLElement>;
	/** UpdateHistory: Update the history index of the display. */
	private UpdateHistory() {
		this.HistoryDisplay.text(`${this.CurrentIndex + 1} / ${this.Records.length}`);
		this.PreviousButton.toggle(true);
		this.NextButton.toggle(this.CurrentIndex < this.Records.length - 1);
	}
	/** UpdateRecords: Update the records. */
	private UpdateRecords() {
		var [Record, Section] = this.Records[this.CurrentIndex];
		// Set the code
		this.Editor.SetCode((Section.Edited ?? Section.Content ?? "").trim());
		this.Editor.ForceParse();
		this.Record = Record;
		// Hide previous records
        var NeedHiding = true;
        for (var Child of this.Subthread!.Children) {
            Child.Container.toggleClass("code-hidden", NeedHiding);
            if ((Child as RecordRenderer).GetData() == Record) NeedHiding = false;
        }
		this.UpdateHistory();
	}
	/** ShowPrevious: Show the previous code section. */
	private ShowPrevious() {
		if (this.CurrentIndex == 0) {
			this.Hide();
			ChatManager.Instance.RequestOption(ChangeTopic());
		} else {
			this.SaveChanges();
			this.CurrentIndex--;
			this.UpdateRecords();
		}
	}
	/** ShowNext: Show the next code section. */
	private ShowNext() {
		this.SaveChanges();
		this.CurrentIndex++;
		this.UpdateRecords();
	}
	/** SetContext: Set the context of the code display. */
	public SetContext(Record: ChatRecord, Subthread: SubthreadRenderer) {
		this.SaveChanges();
		this.Subthread = Subthread;
		this.Records = [];
		for (var Renderer of Subthread.Children) {
			var Current = (Renderer as RecordRenderer).GetData();
			var Section = Current.Response.Sections.find(Section => Section.Type == ChatResponseType.Code);
			if (!Section) continue;
			if (Current == Record) this.CurrentIndex = this.Records.length;
			this.Records.push([Current, Section]);
		}
		this.UpdateRecords();
	}
	/** SaveChanges: Save the changes of the current code section. */
	private SaveChanges() {
		if (!this.Record) return;
		var [Record, Section] = this.Records[this.CurrentIndex];
		Section.Edited = this.Editor.GetCode();
	}
	// #endregion

	// #region "Code Operations"
	/** TryTo: Try to do something that requires grammatically correct code. */
	public TryTo(Action: () => void) {
		this.ExportDiagnostics().then(Diagnostics => {
			if (Diagnostics.length == 0) {
				Action();
			} else {
				this.Tab.Outputs.RenderOptions([
					FixCode(),
					ChangeTopic()
				]);
				this.Tab.Outputs.RenderResponses([
					{
						Type: ChatResponseType.Text,
						Field: "Message",
						Content: Localized.Get("We need to fix the following errors _", Diagnostics.length),
					},
					{
						Type: ChatResponseType.Thought,
						Field: "Code",
						Content: this.Editor.GetCode(),
					},
					{
						Type: ChatResponseType.Thought,
						Field: "HTML",
						Content: this.Editor.Semantics.Highlight().innerHTML.trim().split(/\<br\>/g).join("\n"),
					},
					{
						Type: ChatResponseType.JSON,
						Field: "Diagnostics",
						Content: JSON.stringify(Diagnostics),
						Parsed: Diagnostics
					}
				]);
			}
		});
	}
	/** Fix: Try to fix the code. */
	public async ExportDiagnostics(): Promise<Diagnostic[]> {
		var Diagnostics = await this.Editor.ForceLintAsync();
			Diagnostics = Diagnostics.filter(Diagnostic => Diagnostic.severity == "error");
		return Diagnostics.map(Diagnostic => {
			return {
				Message: NetLogoUtils.PostprocessLintMessage(Diagnostic.message),
				Code: this.Editor.GetCodeSlice(Diagnostic.from, Diagnostic.to),
				From: Diagnostic.from,
				To: Diagnostic.to
			};
		});
	}
	/** Play: Try to play the code. */
	public Play() {
		this.Tab.Outputs.RenderRequest(Localized.Get("Trying to run the code"), this.Record).Transparent = true;
		this.TryTo(() => {
			var Mode = this.Editor.Semantics.GetRecognizedMode();
			var Code = this.Editor.GetCode().trim();
			// Check if we really could execute
			if (!TurtleEditor.PostMessage)
				this.PlayCompiled(true, []);
			// If it is a command or reporter, simply run it
			switch (Mode) {
				case "Command":
					this.Tab.ExecuteCommand("observer", Code, true);
					break;
				case "Reporter":
					this.Tab.ExecuteCommand("observer", `show ${Code}`, true);
					break;
				default:
					TurtleEditor.Call({ Type: "RecompileIncremental", Code: Code });
					break;
			}
		});
	}
	/** PlayCompiled: The callback after the code to play is compiled. */
	public PlayCompiled(Succeeded: boolean, Errors: RuntimeError[]) {
		if (Succeeded) {
			this.Tab.Outputs.RenderResponses([{
				Type: ChatResponseType.Text,
				Content: Localized.Get("Successfully compiled")
			}]);
			this.PlayProcedures();
		} else if (Errors.length == 0) {
			this.Tab.Outputs.RenderResponses([{
				Type: ChatResponseType.CompileError,
				Content: Localized.Get("Compile error unknown")
			}]);
		} else {
			this.Tab.Outputs.RenderResponses([{
				Type: ChatResponseType.CompileError,
				Parsed: Errors
			}, {
				Type: ChatResponseType.JSON,
				Field: "Diagnostics",
				Content: JSON.stringify(Errors),
				Parsed: Errors
			}]);
		}
	}
	/** PlayProcedures: Try to play the available procedures after compilation. */
	private PlayProcedures() {
		var State = this.Editor.GetState();
		var Procedures: Procedure[] = [];
		for (var [Name, Procedure] of State.Procedures) {
			Procedures.push({
				Name: Name,
				IsCommand: Procedure.IsCommand,
				Arguments: [...Procedure.Arguments]
			})
		}
		this.Tab.Outputs.RenderResponses([{
			Type: ChatResponseType.JSON,
			Field: "Procedures",
			Parsed: {
				Procedures: Procedures,
				Temporary: true
			},
		}]);
	}
	/** AddToCode: Add the code to the main editor. */
	public AddToCode() {
		this.Tab.Outputs.RenderRequest(Localized.Get("Trying to add the code"), this.Record).Transparent = true;
		this.TryTo(() => {
			
		});
	}
	/** Ask: Try to ask about the code. */
	public Ask() {
		this.SendRequest(this.Record!.Response.Options[0], this.Record!);
	}
	/** SendRequest: Send a request to the server. */
	private SendRequest(Option: ChatResponseOption, Record: ChatRecord) {
		ChatManager.Instance.RequestOption(Option, Record, (Record) => {
			// Update the code snippet
			Record.Context!.CodeSnippet = this.Editor.GetCode();
		});
	}
	// #endregion
}