import { TurtleEditor } from "../main";
import { Tab } from '../tab';
import { FullTextDisplay } from "./displays/fulltext";
import { OutputDisplay } from "./displays/output";
import { ChatManager } from '../chat/chat-manager';
import { Display } from "./displays/display";
import { CodeDisplay } from "./displays/code";
import { GalapagosEditor, Localized } from "../../../CodeMirror-NetLogo/src/editor";
import { ParseMode } from "../../../CodeMirror-NetLogo/src/editor-config";

declare const { bodyScrollLock, EditorDictionary }: any;

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
	/** Codes: The interactive code area.  */
	public readonly Codes: CodeDisplay;
	/** Sections: The sections of the command center. */
	public readonly Sections: Display[] = [];
	/** ChatManager: The chat interface to the backend. */
	public readonly ChatManager: ChatManager;
	/** Show: Show the command tab.  */
	public Show() {
		if (!this.Visible) this.Editor.Call({ Type: "TabSwitched", Tab: "$Command$" });
		super.Show();
		bodyScrollLock.clearAllBodyScrollLocks();
		bodyScrollLock.disableBodyScroll(this.Outputs.Container.get(0)!);
		bodyScrollLock.disableBodyScroll(this.FullText.Container.get(0)!);
		this.Outputs.Show();
	}
	/** Hide: Hide the command tab. */
	public Hide() {
		super.Hide();
		bodyScrollLock.clearAllBodyScrollLocks();
		bodyScrollLock.disableBodyScroll(document.querySelector('.cm-scroller'), { allowTouchMove: () => true });
	}
	/** Blur: Blur the tab's editor. */
	public Blur() {
		super.Blur();
		this.Galapagos.Blur();
	}
	/** Resize: Resize the tab. */
	public Resize(ViewportHeight: number, ScrollHeight: number) {
		super.Resize(ViewportHeight, ScrollHeight);
		this.Outputs.ScrollToBottom();
		this.Codes.ScrollToBottom();
		return true;
	}
	/** Reset: Reset the command center. */
	public Reset() {
		super.Reset();
		this.ShowInput();
		this.ClearInput();
		this.Outputs.Show();
		this.Outputs.Clear();
		this.ChatManager.Reset();
		this.Outputs.ShowWelcome();
	}
	/** HideAllSections: Hide all sections. */
	public HideAllSections() {
		this.Sections.forEach((Section) => Section.Hide());
	}
	/** Constructor: Initialize the command center. */
	constructor(Container: HTMLElement, Editor: TurtleEditor) {
		super(Container, Editor);
		// Get the elements
		this.CommandLine = $(Container).find(".command-line");
		this.TargetSelect = this.CommandLine.find("select");
		this.TargetSelect.html(`
		<option value="observer">${Localized.Get("Observer")}</option>
		<option value="turtles">${Localized.Get("Turtles")}</option>
		<option value="patches">${Localized.Get("Patches")}</option>
		<option value="links">${Localized.Get("Links")}</option>`)
		// CodeMirror Editor
		this.Galapagos = new GalapagosEditor(this.CommandLine.find(".command-input").get(0)!, {
			OneLine: true,
			ParseMode: ParseMode.Oneline,
			OnKeyUp: (Event: any) => this.InputKeyHandler(Event),
			OnDictionaryClick: (Text: any) => this.ExplainFull(Text)
		});
		// Set up sections
		this.Outputs = new OutputDisplay(this);
		this.Codes = new CodeDisplay(this);
		this.FullText = new FullTextDisplay(this);
		// Set up chat manager
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
			this.Outputs.Show();
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
		Content = Content?.trim() ?? "";
		// Chatable or not
		var Chatable = ChatManager.Available;
		// Special: set domain
		if (Content.startsWith("domain:")) {
			TurtleEditor.SetChatBackend(Content.substring(7).trim());
			this.Reset();
			return;
		}
		// Check if it is a command
		if (!Chatable || (Objective != "chat" && Content != "help" && !Content.startsWith("help ") && !/^[\d\.]+$/.test(Content))) {
			// If there is no linting issues, assume it is code snippet
			this.Galapagos.ForceParse();
			let Diagnostics = await this.Galapagos.ForceLintAsync();
			let Mode = this.Galapagos.Semantics.GetRecognizedMode();
			if (Diagnostics.length == 0) {
				if (Mode == "Reporter" || Mode == "Unknown") Content = `show ${Content}`;
				this.ExecuteInput(Objective, Content);
				return;
			} else if (!Chatable) {
				this.ExecuteInput(Objective, Content);
				return;
			}
		}
		// Otherwise, assume it is a chat message
		this.ClearInput();
		this.ChatManager.SendMessage(Content);
		this.Outputs.ScrollToBottom();
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
		this.Disabled = true;
	}
	// Set the content of command input.
	public SetCode(Objective: string, Content: string) {
		this.TargetSelect.val(Objective.toLowerCase());
		this.Galapagos.SetCode(Content);
		setTimeout(() => this.Galapagos.Selection.SetCursorPosition(Content.length), 1);
	}
	// #endregion

	// #region "Command Execution"
	/** ExecuteInput: Execute a human-sent command. */
	private ExecuteInput(Objective: string, Content: string) {
		// Record command history
		this.CommandStack.push([Objective, Content]);
		this.CurrentCommandIndex = 0;
		this.CurrentCommand = [];
		// Execute command
		this.ExecuteCommand(Objective, Content, true);
		this.ClearInput();
	}
	/** ExecuteCommand: Execute a command. */
	public ExecuteCommand(Objective: string, Content: string, Restart: boolean = false) {
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
			case "help":
				Content = `help ${Content}`;
		}
		// Execute command
		this.Editor.Call({ Type: "CommandExecute", Source: Objective, Command: Content });
		this.Outputs.PrintCommandInput(Content, Restart);
		this.Outputs.ScrollToBottom();
	}
	/** ExplainFull: ExplainFull: Explain the selected text in the command center in full. */
	public ExplainFull(Command: string) {
		if (!EditorDictionary.Check(Command)) return false;
		this.Outputs.ScrollToBottom();
		this.ExecuteCommand("observer", `help ${Command} -full`);
	}
	/** FinishExecution: Notify the completion of the command. */
	public FinishExecution(Status: string, Message: string) {
		this.Outputs.PrintOutput(Status, Message);
		this.Disabled = false;
	}
	// #endregion
}