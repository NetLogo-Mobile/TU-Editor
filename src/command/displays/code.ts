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
import { Diagnostic } from "../../chat/client/languages/netlogo-context";
import { ChangeTopic, FixCode } from '../../chat/client/options/option-templates';

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
		this.PlayButton = $(`<div class="button play">${Localized.Get("Play")}</div>`).on("click", () => this.TryTo(this.Play)).appendTo(Toolbar);
		// this.FixButton = $(`<div class="button fix">${Localized.Get("Fix")}</div>`).on("click", () => this.Fix()).appendTo(Toolbar);
		this.AskButton = $(`<div class="button ask">${Localized.Get("Ask")}</div>`).on("click", () => this.TryTo(this.Ask)).appendTo(Toolbar);
		this.AddToCodeButton = $(`<div class="button addtocode">${Localized.Get("Add to Code")}</div>`).on("click", () => this.AddToCode()).appendTo(Toolbar);
		// Create the history
		var History = $(`<div class="history"></div>`).appendTo(Toolbar);
		this.PreviousButton = $(`<div class="button prev">${Localized.Get("Previous")}</div>`).on("click", () => this.ShowPrevious()).appendTo(History);
		this.HistoryDisplay = $(`<div class="label">0 / 0</div>`).appendTo(History);
		this.NextButton = $(`<div class="button next">${Localized.Get("Next")}</div>`).on("click", () => this.ShowNext()).appendTo(History);
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
		this.PreviousButton.toggle(this.CurrentIndex > 0);
		this.NextButton.toggle(this.CurrentIndex < this.Records.length - 1);
	}
	/** UpdateRecords: Update the records. */
	private UpdateRecords() {
		var [Record, Section] = this.Records[this.CurrentIndex];
		// Set the code
		this.Editor.SetCode(Section.Edited ?? Section.Content ?? "");
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
		this.Editor.ForceLintAsync().then(Diagnostics => {
			Diagnostics = Diagnostics.filter(Diagnostic => Diagnostic.severity == "error");
			if (Diagnostics.length == 0) {
				Action();
			} else {
				// Build the errors
				var Results: Diagnostic[] = [];
				Diagnostics.forEach(Diagnostic => {
					Results.push({
						Message: Diagnostic.message,
						Code: this.Editor.GetCodeSlice(Diagnostic.from, Diagnostic.to),
						From: Diagnostic.from,
						To: Diagnostic.to,
					});
				});
				// Show the errors as a special message
				this.Tab.Outputs.RenderRequest(undefined, this.Record);
				this.Tab.Outputs.RenderResponses([
					{
						Type: ChatResponseType.Text,
						Field: "Message",
						Content: Localized.Get("We need to fix the following errors _", Diagnostics.length),
					},
					{
						Type: ChatResponseType.JSON,
						Field: "Diagnostics",
						Content: JSON.stringify(Results),
						Parsed: Results
					}
				]);
				this.Tab.Outputs.RenderOptions([
					FixCode(),
					ChangeTopic()
				]);
			}
		});
	}
	/** Play: Try to play the code. */
	public Play() {

	}
	/** AddToCode: Add the code to the main editor. */
	public AddToCode() {

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