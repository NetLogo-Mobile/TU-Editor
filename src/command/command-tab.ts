import { TurtleEditor } from "../main";
import { Tab } from '../tab';
import { FullTextDisplay } from "./fulltext";
import { OutputDisplay } from "./outputs";
import { ChatManager } from '../chat/chat-manager';

declare const { bodyScrollLock, EditorDictionary, GalapagosEditor }: any;
type GalapagosEditor = any;

/** CommandTab: A tab for the command center. */
export class CommandTab extends Tab {
	// #region "Foundational Interfaces"
	// Command center would be disabled before compile output come out.
	public Disabled: boolean = false;
	/** Galapagos: Refers to the main this.Editor. */
	public readonly Galapagos: GalapagosEditor;
	/** FullText: The full-text help area. */
	public readonly FullText: FullTextDisplay;
	/** Outputs: The outputs area.  */
	public readonly Outputs: OutputDisplay;
	/** ChatManager: The chat interface to the backend. */
	public readonly ChatManager: ChatManager;
	/** Show: Show the command tab.  */
	public Show() {
		super.Show();
		bodyScrollLock.clearAllBodyScrollLocks();
		bodyScrollLock.disableBodyScroll(this.Outputs.Container.get(0)!);
		bodyScrollLock.disableBodyScroll(this.FullText.Container.get(0)!);
		this.HideFullText();
		this.Outputs.ScrollToBottom();
	}
	/** Hide: Hide the command tab. */
	public Hide() {
		super.Hide();
		bodyScrollLock.clearAllBodyScrollLocks();
		bodyScrollLock.disableBodyScroll(document.querySelector('.cm-scroller'), { allowTouchMove: () => true });
		this.HideFullText();
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
		this.Outputs.ScrollToBottom();
		return true;
	}
	/** Reset: Reset the command center. */
	public Reset() {
		super.Reset();
		this.ShowInput();
		this.ClearInput();
		this.Outputs.ClearOutput();
		this.ChatManager.Reset();
		this.HideFullText();
	}
	/** ShowFullText: Show the full-text help area. */
	public ShowFullText(Data) {
		this.FullText.ShowFullText(Data);
		this.Outputs.Container.hide();
	}
	/** HideFullText: Hide the full-text help area. */
	public HideFullText() {
		this.FullText.HideFullText();
		this.Outputs.Container.show();
		this.Outputs.ScrollToBottom();
	}
	/** Constructor: Initialize the command center. */
	constructor(Container: HTMLElement, Editor: TurtleEditor) {
		super(Container, Editor);
		// Get the elements
		this.CommandLine = $(Container).find(".command-line");
		this.TargetSelect = this.CommandLine.find("select");
		// CodeMirror Editor
		this.Galapagos = new GalapagosEditor(this.CommandLine.find(".command-input").get(0)!, {
			OneLine: true,
			ParseMode: "Oneline",
			OnKeyUp: (Event) => this.InputKeyHandler(Event),
			OnDictionaryClick: (Text) => this.ExplainFull(Text),
			OnFocused: () => { this.OnEditorFocus() },
			OnBlurred: () => { }
		});
		// Set up sections
		this.Outputs = new OutputDisplay(this);
		this.FullText = new FullTextDisplay(this);
		this.ChatManager = new ChatManager(this);
	}
	// #endregion

	// #region "Command Input"
	/** CommandLine: The input area.  */
	public readonly CommandLine: JQuery<HTMLElement>;
	/** TargetSelect: The input area.  */
	public readonly TargetSelect: JQuery<HTMLSelectElement>;
	/** CommandStack: Store the command history. */
	private CommandStack: [string, string][] = [];
	/** CurrentCommand: Store the current command. */
	private CurrentCommand: string[] = [];
	/** CurrentCommandIndex: Store the current command index. */
	private CurrentCommandIndex = 0;
	/** InputKeyHandler: Handle the key input. */
	private InputKeyHandler(Event: KeyboardEvent) {
		const Key = Event.key;
		const Code = Event.code;
		// After press key `Enter`, excute command
		if (Key == "Enter" || Code == "Enter") {
			const Content = this.Galapagos.GetCode();
			this.Galapagos.CloseCompletion();
			if (!Content || this.Disabled) return;
			const Objective = this.TargetSelect.val() as string;
			if (TurtleEditor.PostMessage != null) this.Disabled = true;
			this.HideFullText();
			this.SendCommand(Objective, Content);
		}
		// After press key `ArrowUp`, get previous command from command history
		else if (Key == "ArrowUp" || Code == "ArrowUp") {
			if (this.CurrentCommandIndex >= this.CommandStack.length) return;
			this.CurrentCommandIndex += 1;
			const index = this.CommandStack.length - this.CurrentCommandIndex;
			this.SetCode(this.CommandStack[index][0], this.CommandStack[index][1]);
		}
		// After press key `ArrowDown`, get next command from command history
		else if (Key == "ArrowDown" || Code == "ArrowDown") {
			if (this.CurrentCommandIndex <= 1) {
				this.CurrentCommandIndex = 0;
				if (this.CurrentCommand.length == 0) {
					this.ClearInput();
				} else {
					this.SetCode(this.CurrentCommand[0], this.CurrentCommand[1]);
				}
				return;
			}
			const index = this.CommandStack.length - this.CurrentCommandIndex;
			this.SetCode(this.CommandStack[index][0], this.CommandStack[index][1]);
			this.CurrentCommandIndex -= 1;
		} else if (this.CurrentCommandIndex == 0) {
			const Content = this.Galapagos.GetCode();
			const Objective = this.TargetSelect.val() as string;
			this.CurrentCommand = [Objective, Content];
			this.CurrentCommandIndex = 0;
		}
	}
	/** SendCommand: Send command to either execute or as a chat message. */
	public async SendCommand(Objective: string, Content: string) {
		this.Outputs.ScrollToBottom();
		// Chatable or not
		var Chatable = this.ChatManager.Available;
		if (!Chatable) {
			this.ExecuteUserCommand(Objective, Content);
			return;
		}
		// Check if it is a command
		if (Objective != "chat" && !/^[\d\.]+$/.test(Content)) {
			// If there is no linting issues, assume it is code snippet
			this.Galapagos.ForceParse();
			let Diagnostics = await this.Galapagos.ForceLintAsync();
			let Mode = this.Galapagos.GetRecognizedMode();
			if (Diagnostics.length == 0) {
				if (Mode == "Reporter" || Mode == "Unknown") Content = `show ${Content}`;
				this.ExecuteUserCommand(Objective, Content);
				return;
			}
		}
		// Otherwise, assume it is a chat message
		$(`<p class="output"><span class="you">you&gt;</span>&nbsp;<span></span>`).appendTo(this.Outputs.Container)
			.children("span:eq(1)").text(Content);
		this.Outputs.ScrollToBottom();
		this.ChatManager.SendMessage(Content);
	}
	/** ExecuteUserCommand: Execute a human-sent command. */
	private ExecuteUserCommand(Objective: string, Content: string) {
		// Record command history
		this.Outputs.PrintInput(Objective, Content, false);
		this.CommandStack.push([Objective, Content]);
		this.CurrentCommandIndex = 0;
		this.CurrentCommand = [];
		// Transform command
		switch (Objective.toLowerCase()) {
			case "turtles":
				Content = `ask turtles [ ${Content} ]`;
				break;
			case "patches":
				Content = `ask patches [ ${Content} ]`;
				break;
			case "links":
				Content = `ask links [ ${Content} ]`;
				break;
		}
		// Execute command
		this.Editor.Call({ Type: "CommandExecute", Source: Objective, Command: Content });
		this.ClearInput();
	}
	/** ClearInput: Clear the input box of Command Center. */
	public ClearInput() {
		this.Galapagos.SetCode("");
	}
	/** ShowInput: Show and enable the input box of Command Center. */
	public ShowInput() {
		this.CommandLine.show();
		this.Disabled = false;
	}
	/** HideInput: Hide the input box of Command Center. */
	public HideInput() {
		this.CommandLine.hide();
	}
	// Set the content of command input.
	public SetCode(Objective: string, Content: string) {
		this.TargetSelect.val(Objective.toLowerCase());
		this.Galapagos.SetCode(Content);
		setTimeout(() => this.Galapagos.SetCursorPosition(Content.length), 1);
	}
	// #endregion

	// #region "Command Execution"
	/** FinishExecution: Notify the completion of the command. */
	public FinishExecution(Status: string, Message: string) {
		this.Outputs.PrintOutput(Message, Status);
		this.Disabled = false;
	}
	/** ExecuteCommand: Execute a command. */
	public ExecuteCommand(Objective: string, Content: string) {
		this.Editor.Call({ Type: "CommandExecute", Source: Objective, Command: Content });
		this.Outputs.PrintInput(Objective, Content, false);
		this.Outputs.ScrollToBottom();
	}
	/** ExplainFull: ExplainFull: Explain the selected text in the command center in full. */
	public ExplainFull(Command: string) {
		if (!EditorDictionary.Check(Command)) return false;
		this.Outputs.ScrollToBottom();
		this.ExecuteCommand("observer", `help ${Command} -full`);
	}
	// #endregion

	/** AnnotateCode: Annotate some code snippets. */
	public AnnotateCode(Target: JQuery<HTMLElement>, Content?: string, Copyable?: boolean) {
		var This = this;
		for (var Item of Target.get()) {
			var Snippet = $(Item);
			// Render the code
			Content = Content ? Content : Item.innerText;
			var Output = this.Galapagos.Highlight(Content);
			Snippet.empty().append($(Output));
			// Copy support
			if (Copyable && Content.trim().indexOf(" ") >= 0 && Content.trim().indexOf("\n") == 0 && Snippet.parent("pre").length == 0)
				Snippet.data("Code", Content).addClass("copyable").append($(`<img class="copy-icon" src="images/copy.png"/>`))
					.on("click", function() {
						This.SetCode("observer", $(this).data("Code"));
					});
		}
	}
}