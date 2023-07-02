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
import { DiagnosticType, Diagnostics, Procedure } from "../../chat/client/languages/netlogo-context";
import { ChangeTopic } from '../../chat/client/options/option-templates';
import { CopyCode } from "../../utils/misc";
import { SectionRenderer } from "../sections/section-renderer";

/** CodeDisplay: The interactive code editor section. */
export class CodeDisplay extends Display {
	// #region "Interfaces"
	/** Editor: The editor instance. */
	public Editor: GalapagosEditor;
	/** Instance: The singleton instance. */
	public static Instance: CodeDisplay;
	/** FinishButton: The return button of the display. */
	private FinishButton: JQuery<HTMLElement>;
	/** PlayButton: The play button of the display. */
	private PlayButton: JQuery<HTMLElement>;
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
				ParseMode: ParseMode.Generative,
				OnDictionaryClick: (Text: string) => this.Tab.ExplainPrimitive(Text),
				OnExplain: (Diagnostic, Context) => this.Tab.ExplainDiagnostic({
					Message: NetLogoUtils.PostprocessLintMessage(Diagnostic.message),
					Code: this.Editor.GetCodeSlice(Diagnostic.from, Diagnostic.to)
				}, Context, false)
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
		this.FinishButton = $(`<div class="button finish">${Localized.Get("Finish")}</div>`).on("click", () => this.Return()).appendTo(Toolbar);
		this.PlayButton = $(`<div class="button run">${Localized.Get("RunCode")}</div>`).on("click", () => this.Play()).appendTo(Toolbar);
		this.AskButton = $(`<div class="button ask">${Localized.Get("AskCode")}</div>`).hide().on("click", () => this.Ask()).appendTo(Toolbar);
		this.AddToCodeButton = $(`<div class="button addtocode">${Localized.Get("CopyCode")}</div>`).on("click", () => this.AddToCode()).appendTo(Toolbar);
		// Create the history
		var History = $(`<div class="history"></div>`).appendTo(Toolbar);
		this.PreviousButton = $(`<div class="button prev">&lt;</div>`).on("click", () => this.ShowPrevious()).appendTo(History);
		this.HistoryDisplay = $(`<div class="label">0 / 0</div>`).appendTo(History);
		this.NextButton = $(`<div class="button next">&gt;</div>`).on("click", () => this.ShowNext()).appendTo(History);
		CodeDisplay.Instance = this;
	}
    /** Show: Show the section. */
    public Show() {
		if (this.Visible) return;
		if (!this.Tab.Visible) this.Tab.Show();
		// Show the output tab as well
		this.Tab.Outputs.Show();
		this.Tab.Outputs.Container.addClass("code-enabled");
		this.Editor.SyncContext(this.Tab.Galapagos);
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
		this.Tab.Editor.EditorTabs[0].Galapagos.SyncContext(this.Tab.Galapagos);
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
		this.PreviousButton.toggleClass("hidden", this.CurrentIndex < 1);
		this.NextButton.toggleClass("hidden", this.CurrentIndex >= this.Records.length - 1);
	}
	/** UpdateRecords: Update the records. */
	private UpdateRecords() {
		var [Record, Section] = this.Records[this.CurrentIndex];
		// Set the code
		this.Editor.SetCode((Section.Edited ?? Section.Content ?? "").trim());
		this.Editor.ForceParse();
		this.Editor.Selection.SetCursorPosition(0);
		this.Record = Record;
		// Hide previous records
        var NeedHiding = this.CurrentIndex !== 0;
        for (var Child of this.Subthread!.Children) {
            if ((Child as RecordRenderer).GetData() == Record) {
				Child.Container.toggleClass("code-output", true);
				NeedHiding = false;
			} else {
				Child.Container.toggleClass("code-output", false);
			}
            Child.Container.toggleClass("code-hidden", NeedHiding);
        }
		this.UpdateHistory();
	}
	/** Return: Leave the mode immediately. */
	private Return() {
		this.Hide();
		ChatManager.Instance.RequestOption(ChangeTopic());
	}
	/** ShowPrevious: Show the previous code section. */
	private ShowPrevious() {
		this.SaveChanges();
		this.CurrentIndex--;
		this.UpdateRecords();
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
			var Section = Current.Response.Sections.find(Section => 
				Section.Type == ChatResponseType.Code || Section.Edited !== undefined);
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
		this.Editor.Semantics.PrettifyAll();
		this.ExportDiagnostics().then(Diagnostics => {
			if (Diagnostics.Diagnostics.length == 0) {
				Action();
			} else {
				// Diagnostics.Hidden = true;
				this.Tab.Outputs.RenderOptions([ ChangeTopic() ]);
				this.Tab.Outputs.RenderResponses([
					{
						Type: ChatResponseType.CompileError,
						Field: "Message",
						Content: Localized.Get("We need to fix the following errors _", Diagnostics.Diagnostics.length),
					},
					{
						Type: ChatResponseType.JSON,
						Field: "Diagnostics",
						Parsed: Diagnostics
					}
				], true);
			}
		});
	}
	/** Fix: Try to fix the code. */
	public async ExportDiagnostics(): Promise<Diagnostics> {
		var Diagnostics = await this.Editor.ForceLintAsync();
			Diagnostics = Diagnostics.filter(Diagnostic => Diagnostic.severity == "error");
		return {
			Type: DiagnosticType.Compile,
			Code: this.Editor.GetCode(),
			Diagnostics: NetLogoUtils.GetUniqueDiagnostics(Diagnostics.map(Diagnostic => {
				return {
					Message: NetLogoUtils.PostprocessLintMessage(Diagnostic.message),
					Code: this.Editor.GetCodeSlice(Diagnostic.from, Diagnostic.to)
				};
			}))
		};
	}
	/** Play: Try to play the code. */
	public Play(Callback?: () => void) {
		if (this.Tab.Disabled) return;
		// Hide the previous successful and uneventful execution
		var LastSubthread = this.Tab.Outputs.Subthread;
		if (LastSubthread && LastSubthread.Children.length > 0) {
			var LastRecord = LastSubthread.Children[LastSubthread.Children.length - 1] as RecordRenderer;
			var LastData = LastRecord.GetData();
			if (LastData.Operation === "Execute" && LastRecord.Children.length >= 2) {
				var FirstType = (LastRecord.Children[1] as SectionRenderer).GetData().Type;
				if (FirstType === ChatResponseType.Finish || FirstType === ChatResponseType.Text)
					LastRecord.Container.hide();
			} else if (LastData.Operation === "TryExecute")
				LastRecord.Container.hide();
		}
		// Create a new record
		var Record = this.Tab.Outputs.RenderRequest(Localized.Get("Trying to run the code"), this.Record);
		Record.GetData().Operation = "TryExecute";
		Record.GetData().Transparent = true;
		// Try to play the code
		this.TryTo(() => {
			// Custom callback
			if (Callback !== undefined) {
				Callback();
				Record.Container.hide();
				return;
			}
			// Get the code
			var Mode = this.Editor.Semantics.GetRecognizedMode();
			var Code = this.Editor.GetCode().trim();
			if (Code === "") return;
			// ExecuteCommand: Execute the command.
			var ExecuteCommand = (Code: string) => {
				Record.Container.hide();
				this.Tab.SetDisabled(true);
				this.Tab.ExecuteCommand("observer", Code, true);
			}
			// If it is a command or reporter, simply run it
			switch (Mode) {
				case "Command":
					ExecuteCommand(Code);
					break;
				case "Reporter":
					ExecuteCommand(`show ${Code}`);
					break;
				default:
					var State = this.Editor.GetState();
					// Names of procedures
					var Procedures: string[] = [];
					var FirstProcedure: Procedure | null = null;
					for (var [Name, Procedure] of State.Procedures) {
						FirstProcedure = FirstProcedure ?? Procedure;
						Procedures.push(Name);
					}
					// Immediate execution
					if (Procedures.length === 1 && FirstProcedure?.Arguments.length == 0) {
						if (FirstProcedure.IsCommand) {
							this.Tab.RecompileTemporarily(Code, Procedures, () => {
								ExecuteCommand(FirstProcedure!.Name);
							});
						} else {
							this.Tab.RecompileTemporarily(Code, Procedures, () => {
								ExecuteCommand(`show ${FirstProcedure!.Name}`);
							});
						}
					} else {
						this.Tab.RecompileTemporarily(Code, Procedures, () => this.PlayProcedures());
					}
					break;
			}
		});
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
				IsTemporary: true
			},
		}], true);
	}
	/** AddToCode: Add the code to the main editor. */
	public AddToCode() {
		// this.Tab.Outputs.RenderRequest(Localized.Get("Trying to add the code"), this.Record).GetData().Transparent = true;
		this.TryTo(() => {
			CopyCode(this.Editor.GetCode());
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