import { TurtleEditor } from "../main";
import { Tab } from '../tab';
import { FullTextDisplay } from "./displays/fulltext";
import { OutputDisplay } from "./displays/output";
import { ChatManager } from '../chat/chat-manager';
import { Display } from "./displays/display";
import { CodeDisplay } from "./displays/code";
import { GalapagosEditor, Localized } from "../../../CodeMirror-NetLogo/src/editor";
import { ParseMode } from "../../../CodeMirror-NetLogo/src/editor-config";
import { Diagnostics, DiagnosticType, Procedure } from "../chat/client/languages/netlogo-context";
import { CodeArguments } from "./renderers/arguments-renderer";
import { ChatResponseType } from "../chat/client/chat-response";
import { RuntimeError } from "../../../CodeMirror-NetLogo/src/lang/linters/runtime-linter";
import { ErrorsToDiagnostics } from "../utils/netlogo";

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
	/** Placeholder: The placeholder for the command center. */
	public readonly Placeholder: JQuery<HTMLElement>;
	/** SendButton: The send button. */
	public readonly SendButton: JQuery<HTMLElement>;
	/** Show: Show the command tab.  */
	public Show() {
		if (!this.Visible) TurtleEditor.Call({ Type: "TabSwitched", Tab: "$Command$" });
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
		this.EnableInput();
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
		this.Placeholder = $("<span></span>");
		this.Galapagos = new GalapagosEditor(this.CommandLine.find(".command-input").get(0)!, {
			OneLine: true,
			ParseMode: ParseMode.Oneline,
			Placeholder: this.Placeholder.get(0),
			OnKeyUp: (Event: any) => this.InputKeyHandler(Event),
			OnDictionaryClick: (Text: any) => this.ExplainFull(Text)
		});
		// Send button
		this.SendButton = $(`<div class="command-send"><div class="dot-stretching"></div></div>`).on("click", () => {
			this.InputKeyHandler({ key: "Enter", code: "Enter" });
		}).insertAfter($(this.Galapagos.Parent.lastChild!));
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
	private InputKeyHandler(Event: {key: string, code: string}) {
		const Key = Event.key;
		const Code = Event.code;
		// After press key `Enter`, excute command
		if (Key == "Enter" || Code == "Enter") {
			const Content = this.Galapagos.GetCode();
			this.Galapagos.CloseCompletion();
			if (!Content || this.Disabled) return;
			const Objective = this.TargetSelect.val() as string;
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
			// Parse the code
			this.Galapagos.ForceParse();
			let Diagnostics = await this.Galapagos.ForceLintAsync();
			let Mode = this.Galapagos.Semantics.GetRecognizedMode();
			// Check if the context is temporary
			var Temporary = this.Codes.Visible;
			// If there is no linting issues, assume it is code snippet
			if (Diagnostics.length == 0) {
				if (Mode == "Reporter" || Mode == "Unknown") Content = `show ${Content}`;
				this.SetDisabled(true);
				this.ExecuteInput(Objective, Content, Temporary);
				return;
			} else if (!Chatable) {
				this.SetDisabled(true);
				this.ExecuteInput(Objective, Content, Temporary);
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
	/** EnableInput: Show and enable the input box of Command Center. */
	public EnableInput() {
		this.Galapagos.SetReadOnly(false);
		this.SetDisabled(false);
	}
	/** DisableInput: Hide the input box of Command Center. */
	public DisableInput() {
		this.Galapagos.SetReadOnly(true);
		this.SetDisabled(true);
	}
	/** SetCode: Set the content of command input. */
	public SetCode(Objective: string, Content: string) {
		this.TargetSelect.val(Objective.toLowerCase());
		this.Galapagos.SetCode(Content);
		setTimeout(() => this.Galapagos.Selection.SetCursorPosition(Content.length), 1);
	}
	/** SetDisabled: Set the disabled state of the command center. */
	public SetDisabled(Disabled: boolean) {
		this.Disabled = Disabled;
		this.RefreshPlaceholder();
	}
	/** RefreshPlaceholder: Refresh the placeholder. */
	public RefreshPlaceholder() {
		if (this.Disabled) {
			if (ChatManager.IsRequesting) {
				this.Placeholder.text(Localized.Get("Waiting for the AI to respond"));
			} else {
				this.Placeholder.text(Localized.Get("Waiting for the execution to finish"));
			}
		} else {
			if (ChatManager.Available) {
				if (this.Galapagos.IsReadOnly) {
					this.Placeholder.text(Localized.Get("Please choose one option first"));
				} else {
					var Text = this.ChatManager.PendingRequest?.FriendlyInput ?? this.ChatManager.PendingRequest?.Input;
					this.Placeholder.text(Text ?? Localized.Get("Talk to the computer in NetLogo or natural languages"));
				}
			} else {
				this.Placeholder.text(Localized.Get("Type NetLogo command here"));
			}
		}
		this.SendButton.toggleClass("disabled", this.Disabled);
	}
	// #endregion

	// #region "Command Execution"
	/** ExecuteInput: Execute a human-sent command. */
	private ExecuteInput(Objective: string, Content: string, Temporary: boolean) {
		// Record command history
		this.CommandStack.push([Objective, Content]);
		this.CurrentCommandIndex = 0;
		this.CurrentCommand = [];
		// Execute command
		this.ExecuteCommand(Objective, Content, Temporary, true);
		this.ClearInput();
	}
	/** ExecuteCommand: Execute a command. */
	public ExecuteCommand(Objective: string, Content: string, IsTemporary: boolean, Restart: boolean = false) {
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
		TurtleEditor.Call({ Type: "CommandExecute", Source: Objective, Command: Content, IsTemporary: IsTemporary });
		var Record = this.Outputs.PrintCommandInput(Content, Restart);
		Record.Context = Record.Context ?? { PreviousMessages: [] };
		Record.Context.CodeSnippet = Content;
		Record.Operation = "Execute";
		this.Outputs.ScrollToBottom();
		// Check if we really could execute
		this.Editor.CheckExecution();
	}
    /** ExecuteProcedure: Execute the procedure. */
    public ExecuteProcedure(Procedure: Procedure, IsTemporary: boolean): void {
		if (Procedure.Arguments.length > 0) {
			var Package: CodeArguments = {
				Procedure: Procedure.Name,
				IsTemporary: IsTemporary,
				Arguments: Procedure.Arguments.map((Argument) => {
					return { Name: Argument, };
				})
			};
			this.Outputs.RenderRequest(
				Localized.Get("Trying to run the procedure _", Procedure.Name)
			);
			this.Outputs.RenderResponses([{
				Type: ChatResponseType.Text,
				Content: Localized.Get("Arguments needed for execution _", Procedure.Name, Procedure.Arguments.length)
			}, {
				Type: ChatResponseType.JSON,
				Field: "Arguments",
				Parsed: Package
			}], true);
		} else {
			this.ExecuteProcedureWithArguments(Procedure.Name, IsTemporary, {})
		}
    }
	/** ExecuteProcedureWithArguments: Execute the procedure with arguments. */
	public ExecuteProcedureWithArguments(Name: string, IsTemporary: boolean, Arguments: Record<string, string>): void {
		if (this.Disabled) return;
		this.SetDisabled(true);
		// Generate the code
		var Code = `${Name} ${Object.keys(Arguments).map(Key => `${this.FormatArgument(Arguments[Key])}`).join(" ")}`;
		// Execute it
		this.ExecuteCommand("observer", Code, IsTemporary);
	}
	/** FormatArgument: Format the argument. */
	private FormatArgument(Value: string): string {
		return !Value.startsWith("[") && !Value.startsWith("\"") && Value.indexOf(" ") != -1 && !Value.endsWith("]") ? `"${Value}"` : Value;
	}
	/** ExplainFull: ExplainFull: Explain the selected text in the command center in full. */
	public ExplainFull(Command: string) {
		if (!EditorDictionary.Check(Command)) return false;
		this.ExecuteCommand("observer", `help ${Command} -full`, false);
	}
	/** RecompileCallback: The callback after the code to play is compiled. */
	private RecompileCallback?: (() => void);
	/** TemporaryCode: The temporary code snippet that is in-use. */
	private TemporaryCode?: string;
	/** RecompileTemporarily Recompile the code snippet temporarily. */
	public RecompileTemporarily(Code: string, Procedures: string[], Callback: () => void) {
		if (this.Disabled) return;
		this.SetDisabled(true);
		this.RecompileCallback = Callback;
		// If the code is not the same, recompile it
		if (this.TemporaryCode != Code) {
			TurtleEditor.Call({ Type: "RecompileTemporarily", Code: Code, Procedures: Procedures });
			this.TemporaryCode = Code;
		} else {
			// Otherwise, just play it
			this.PlayCompiled(true, []);
			return;
		}
		// If we do not support, also play it
		if (!TurtleEditor.PostMessage)
			this.PlayCompiled(true, []);
	}
	/** PlayCompiled: The callback after the code to play is compiled. */
	public PlayCompiled(Succeeded: boolean, Errors?: RuntimeError[]) {
		this.SetDisabled(false);
		if (Succeeded) {
			this.Outputs.RenderResponses([{
				Type: ChatResponseType.Text,
				Content: Localized.Get("Successfully compiled")
			}], false);
			this.RecompileCallback?.();
		} else if (!Errors || Errors.length == 0) {
			this.Outputs.RenderResponses([{
				Type: ChatResponseType.CompileError,
				Content: Localized.Get("Compile error in model")
			}], true);
			delete this.TemporaryCode;
		} else {
			this.Codes.Editor.SetCompilerErrors(Errors);
			// Build the diagnostics
			var Diagnostics: Diagnostics = {
				Type: DiagnosticType.Compile,
				Diagnostics: ErrorsToDiagnostics(Errors),
				Code: this.TemporaryCode
			};
			// Show the diagnostics
			this.Outputs.RenderResponses([{
				Type: ChatResponseType.CompileError,
				Parsed: Diagnostics.Diagnostics.length
			}, {
				Type: ChatResponseType.JSON,
				Field: "Diagnostics",
				Parsed: Diagnostics
			}], true);
			delete this.TemporaryCode;
		}
	}
	// #endregion
}