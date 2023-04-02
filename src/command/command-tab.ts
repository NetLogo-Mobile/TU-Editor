import { TurtleEditor } from "../main";
import { Localized } from "../legacy";
import { Tab } from '../tab';
import { TransformLinks } from "../utils/element";

declare const { bodyScrollLock, showdown, EditorDictionary, GalapagosEditor }: any;
type GalapagosEditor = any;

/** CommandTab: A tab for the command center. */
export class CommandTab extends Tab {
    // #region "Foundational Interfaces"
	// Command center would be disabled before compile output come out.
	public Disabled: boolean = false;
	// Galapagos: Refers to the main this.Editor.
	public readonly Galapagos: GalapagosEditor;

	// Show: Show the command tab. 
	public Show() {
        super.Show();
		bodyScrollLock.clearAllBodyScrollLocks();
		bodyScrollLock.disableBodyScroll(this.Outputs.get(0)!);
		bodyScrollLock.disableBodyScroll(this.Fulltext.get(0)!);
	}
	// Hide: Hide the command tab.
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

	// Following three variables are used for command histrory.
	private CommandStack: [string, string][] = [];
	private CurrentCommand: string[] = [];
	private CurrentCommandIndex = 0;

	// Constructor: Initialize the command center.
	constructor(Container: HTMLElement, Editor: TurtleEditor) {
        super(Container, Editor);
		// Get the elements
		this.Outputs = $(Container).find(".command-output");
		this.Fulltext = $(Container).find(".command-fulltext");
		this.CommandLine = $(Container).find(".command-line");
        this.TargetSelect = this.CommandLine.find("select");
		this.KeepSize = this.Outputs.children(".Keep").length;
		// CodeMirror Editor
		this.Galapagos = new GalapagosEditor(this.CommandLine.find(".command-input").get(0)!, {
			OneLine: true, 
			OnKeyUp: (Event) => {
				const Key = Event.key;
				const Code = Event.code;
				// After press key `Enter`, excute command
				if (Key == "Enter" || Code == "Enter") {
					const Content = this.Galapagos.GetCode();
					this.ClearInput();
					if (!Content || this.Disabled) return;
					const Objective = this.TargetSelect.val() as string;
					if (TurtleEditor.PostMessage != null) this.Disabled = true;
					this.Execute(Objective, Content);
					this.CommandStack.push([Objective, Content]);
					this.CurrentCommandIndex = 0;
					this.CurrentCommand = [];
					this.Galapagos.CloseCompletion();
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
			},
			OnDictionaryClick: (Text) => this.ExplainFull(Text)
		});

		// Annotate by default
		this.AnnotateCode(this.Outputs.find(".keep code"), null, true);

		// Listen to the sizing
		if (window.visualViewport)
			window.visualViewport.addEventListener("resize", () => {
				if (navigator.userAgent.indexOf("Macintosh") == -1 && navigator.userAgent.indexOf("Mac OS X") == -1) {
					var Height = window.visualViewport!.height;
					$(this.Editor.Container).css("height", `${Height}px`);
				} else {
					setTimeout(() => this.Outputs.add(this.Fulltext)
                        .css("padding-top", `calc(0.5em + ${document.body.scrollHeight - window.visualViewport!.height}px)`), 100);
				}
				if (this.Visible) this.Outputs.scrollTop(100000);
			});
	}
    // #endregion
    
    // #region "Command Input"
    // CommandLine: The input area. 
	public readonly CommandLine: JQuery<HTMLElement>;
    // TargetSelect: The input area. 
	public readonly TargetSelect: JQuery<HTMLSelectElement>;
    // #endregion

    // Outputs: The outputs area. 
	public readonly Outputs: JQuery<HTMLElement>;
	// Fragment: Batch printing support for batch printing.
	private Fragment: JQuery<DocumentFragment> | null = null;
	// BufferSize: Buffer size for batch printing.
	private BufferSize = 1000;
	// KeepSize: The number of messages that are kept forever. 
	private KeepSize = -1;
	// Print to a batch.
	private WriteOutput(Element) {
		if (this.Fragment == null)
			this.Outputs.append(Element);
		else this.Fragment.append(Element);
	}
	// Open a printing batch.
	OpenBatch() {
		this.Fragment = $(document.createDocumentFragment());
	}
	// Close a printing batch.
	CloseBatch() {
		if (this.Fragment == null) return;
		// Trim the buffer (should refactor later) & the display
		var Length = this.Fragment.children().length;
		if (Length > this.BufferSize) {
			this.Fragment.children().slice(0, Length - this.BufferSize).remove();
			this.Outputs.children().slice(this.KeepSize).remove();
		} else {
			var NewLength = this.Outputs.children().length - this.KeepSize + Length;
			if (NewLength > this.BufferSize)
                this.Outputs.children().slice(this.KeepSize, NewLength - this.BufferSize + this.KeepSize).remove();
		}
		// Append to the display
		this.Outputs.append(this.Fragment);
		this.Fragment = null;
		this.ScrollToBottom();
	}

	// Print a line of input to the screen
	PrintInput(Objective, Content, Embedded) {
		if (Objective == null) Objective = this.TargetSelect.val();
		else this.TargetSelect.val(Objective);

		// CodeMirror Content
		var Wrapper = $(`
			<div class="command-wrapper">
				<div class="content">
					<p class="input Code">${Objective}&gt;<span></span></p>
				</div>
				<div class="icon">
					<img class="copy-icon" src="images/copy.png"/>
				</div>
			</div>
		`);
		
		if (!Embedded) this.WriteOutput(Wrapper);
		Wrapper.attr("objective", Objective);
		Wrapper.attr("content", Content);

		// Click to copy
		Wrapper.children(".icon").on("click", () => {
			this.SetCode(Wrapper.attr("objective"), Wrapper.attr("content"));
			this.Editor.Call({ Type: "ClipboardWrite", Content: `${Wrapper.attr("objective")}: ${Wrapper.attr("content")}` });
		});

		// Run CodeMirror
		this.AnnotateCode(Wrapper.children(".content").children(".Code").children("span"), Content, false);
		return Wrapper;
	}

	// Provide for Unity to print compiled output
	PrintOutput(Content, Class) {
	    var Output: JQuery<HTMLElement> | null = null;
		switch (Class) {
			case "CompilationError":
				Output = $(`
					<p class="CompilationError output">${Localized.Get("抱歉，未能理解你输入的命令")}: ${Content}</p>
				`);
				break;
			case "RuntimeError":
				Output = $(`<p class="RuntimeError output"></p>`);
				Output.get(0)!.innerText = Localized.Get(Content);
				break;
			case "Succeeded":
				Output = $(`
					<p class="Succeeded output">${Localized.Get("成功执行了命令。")}</p>
				`);
				break;
			case "Output":
				Output = $(`<p class="Output output"></p>`);
				Output.get(0)!.innerText = Content;
				break;
			case "Help":
				if (typeof Content === 'string') {
					if (Content.indexOf("<div class=\"block\">") >= 0) {
						Output = $(Content);
					} else {
						Output = $(`
							<p class="${Class} output">${Content}</p>
						`);
					}
				} else if (Content instanceof Array) {
					Output = $(`
						<div class="block">
							${Content.map((Source) => `<p class="${Class} output">${Source}</p>`).join("")}
						</div>
					`);
				} else if (Content.Parameter == "-full") {
					this.ShowFullText(Content);
				} else {
					Output = $(`
						<div class="block">
							<p class="${Class} output"><code>${Content["display_name"]}</code> - ${Content["agents"].map((Agent) => `${this.RenderAgent(Agent)}`).join(", ")}</p>
							<p class="${Class} output">${Content["short_description"]} (<a class='command' target='help ${Content["display_name"]} -full'">${Localized.Get("阅读全文")}</a>)</p>
							<p class="${Class} output">${Localized.Get("参见")}: ${Content["see_also"].map((Name) => `<a class='command' target='help ${Name}'>${Name}</a>`).join(", ")}</p>
						</div>
					`);
				}
				if (Output != null) {
					this.LinkCommand(Output.find("a.command"));
					this.AnnotateInput(Output.find("div.command"));
					this.AnnotateCode(Output.find("code"));
				}
				break;
			default:
				Output = $(`
					<p class="${Class} output">${Content}</p>
				`);
				break;
		}
		this.WriteOutput(Output);

		if (this.Fragment == null) this.ScrollToBottom();
	}
	
	/* Rendering stuff */
	// Annotate some code snippets.
	private AnnotateCode(Target, Content?, Copyable?) {
		for (var Item of Target.get()) {
			var Snippet = $(Item);
			// Render the code
			var Output = this.Galapagos.Highlight(Content ? Content : Item.innerText);
			Snippet.empty().append($(Output));
			// Copy support
			if (Copyable && Item.innerText.trim().indexOf(" ") >= 0 && Snippet.parent("pre").length == 0)
				Snippet.addClass("copyable").append($(`<img class="copy-icon" src="images/copy.png"/>`)).on("click", () => {
					this.SetCode("observer", Snippet.text());
				});
		}
	}
	
	// Annotate some code inputs.
	private AnnotateInput(Query) {
		Query.each((Index, Item) => {
			Item = $(Item);
			Item.replaceWith(this.PrintInput(Item.attr("objective"), Item.attr("target"), true));
		});
	}

	// Generate a link for another command.
	private LinkCommand(Query) {
		Query.each((Index, Item) => {
			Item = $(Item);
			var Target = Item.attr("target");
			if (Target == null) Target = Item.text();
			var Objective = Item.attr("objective");
			if (!Objective) Objective = "null";
			Item.attr("href", "javascript:void(0)");
			Item.attr("onclick", `this.Execute(${Objective}, '${Target}')`);
		})
		return Query;
	}

	// Render tips for an agent type.
	private RenderAgent(Agent) {
		var Message = Agent;
		switch (Agent) {
			case "turtles":
				Message = `${Localized.Get("海龟")}🐢`;
				break;
			case "patches":
				Message = `${Localized.Get("格子")}🔲`;
				break;
			case "links":
				Message = `${Localized.Get("链接")}🔗`;
				break;
			case "observer":
				Message = `${Localized.Get("观察者")}🔎`;
				break;
			case "utilities":
				Message = `${Localized.Get("工具")}🔨`;
				break;
		}
		return Message;
	}

	// Clear the input box of Command Center
	ClearInput() {
		this.Galapagos.SetCode("");
	}

	// Clear the output region of Command Center
	ClearOutput() {
		this.Outputs.children().slice(this.KeepSize).remove();
	}

	// After user entered input, screen view should scroll down to the botom line
	ScrollToBottom() {
		this.Outputs.scrollTop(this.Outputs.get(0)!.scrollHeight);
	}

	// Execute a command from the user
	Execute(Objective, Content) {
		this.Editor.Call({ Type: "CommandExecute", Source: Objective, Command: Content });
		this.PrintInput(Objective, Content, false);
		this.ScrollToBottom();
	}

	// Set the content of command input
	SetCode(Objective, Content) {
		this.TargetSelect.val(Objective.toLowerCase());
		this.Galapagos.SetCode(Content);
		setTimeout(() => this.Galapagos.SetCursorPosition(Content.length), 1);
	}

	// Provide for Unity to notify completion of the command
	FinishExecution(Status, Message) {
		this.HideFullText();
		this.PrintOutput(Message, Status);
		this.Disabled = false;
	}

    // Fulltext: The full-text help area. 
	public readonly Fulltext: JQuery<HTMLElement>;
    // RequestedTab: The tab that requested the full text.
	private RequestedTab: Tab | null = null;

	// Show the full text of a command.
	ShowFullText(Data) {
		this.RequestedTab = this.Editor.CurrentTab;
		if (!this.Visible) this.Show();
		// Change the status
		this.Fulltext.show();
		this.Outputs.hide();
		// Render the subject
		this.Fulltext.find("h2 strong").text(Data["display_name"]);
		this.Fulltext.find("h2 span").text(`(${Data["agents"].map((Agent) => `${this.RenderAgent(Agent)}`).join(", ")})`);
		// Render the list
		var SeeAlso = this.Fulltext.find("ul.SeeAlso").empty();
		for (var Primitive in Data["see_also"])
            this.LinkCommand($(`<li><a class="command" target="help ${Primitive}">${Primitive}</a> - ${Data["see_also"][Primitive]}</li>`).appendTo(SeeAlso).find("a"));
		// Machine-translation
		var Translator = this.Fulltext.find(".translator");
		if (Data["translation"] != null && Data["verified"] != true)
			Translator.show();
		else Translator.hide();
		var Original = Translator.find("a.Original").bind("click", () => {
			Original.hide();
			Translation.show();
			SetCode(Data["content"]);
		}).parent().show();
		var Translation = Translator.find("a.Translation").bind("click", () => {
			Translation.hide();
			Original.show();
			SetCode(Data["translation"]);
		}).parent().hide();
		// Render the full text
		var SetCode = (Content) => {
			if (Content != null) this.Fulltext.find("div.fulltext")
				.html(new showdown.Converter().makeHtml(Content));
			this.AnnotateCode(this.Fulltext.find("code"), null, true);
			this.Fulltext.scrollTop(0);
		}
		SetCode(Data["translation"] != null ? Data["translation"] : Data["content"]);
		// Acknowledge
		TransformLinks(this.Fulltext.find(".Acknowledge").html(Data["acknowledge"]));
	}

	// Hide the full text mode.
	HideFullText() {
		if (!this.Fulltext.is(":visible")) return;
		this.Fulltext.hide();
		this.Outputs.show();
		this.ScrollToBottom();
        this.RequestedTab?.Show();
	}

	// ExplainFull: Explain the selected text in the command center in full.
	ExplainFull(Command: string) {
		if (!EditorDictionary.Check(Command)) return false;
		this.ScrollToBottom();
		this.Execute("observer", `help ${Command} -full`);
	}
}