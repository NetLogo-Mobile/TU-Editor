import { SubthreadRenderer } from "../outputs/subthread-renderer";
import { ChatSubthread } from "../../chat/client/chat-thread";
import { ChatRecord } from "../../chat/client/chat-record";
import { RecordRenderer } from "../outputs/record-renderer";
import { Display } from "./display";
import { CommandTab } from "../command-tab";
import { ChatResponseSection, ChatResponseType } from "../../chat/client/chat-response";
import { ChatResponseOption } from "../../chat/client/chat-option";
import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { ChatManager } from "../../chat/chat-manager";

/** OutputDisplay: Display the output section. */
export class OutputDisplay extends Display {
	/** Instance: The singleton instance. */
	public static Instance: OutputDisplay;
	/** Constructor: Create a new output section. */
	public constructor(Tab: CommandTab) {
		super(Tab, ".command-output");
		this.ScrollContainer = this.Container.find(".outputs");
		OutputDisplay.Instance = this;
	}

	// #region "Threading Support"
	/** Subthread: The active subthread. */
	private Subthread?: SubthreadRenderer;
	/** Subthreads: The subthread store. */
	private Subthreads: Map<ChatSubthread, SubthreadRenderer> = new Map<ChatSubthread, SubthreadRenderer>();
	/** Show: Show the output region of Command Center. */
	public Show() {
		super.Show();
		this.ScrollToBottom();
	}
	/** Clear: Clear the output region of Command Center. */
	public Clear() {
		this.ScrollContainer.empty();
		this.Subthreads.clear();
		delete this.Subthread;
	}
	/** RenderRecord: Render a new chat record. */
	public RenderRecord(Record: ChatRecord, Subthread: ChatSubthread): RecordRenderer {
		var Renderer: RecordRenderer;
		// Restart the batch if necessary
		this.RestartBatch();
		// Create a new subthread if necessary
		if (Subthread != this.Subthread?.GetData()) {
			this.Subthread?.Container.removeClass("activated");
			this.Subthread?.DeactivateAll("activated");
			this.Subthread = this.Subthreads.get(Subthread);
			if (this.Subthread == null) {
				this.Subthread = new SubthreadRenderer(this);
				this.ScrollContainer.append(this.Subthread.Container);
				this.Subthread.SetData(Subthread);
				this.Subthreads.set(Subthread, this.Subthread);
			}
			this.Subthread.SetStatus("active");
			this.Tab.Codes.Hide();
			this.ScrollToBottom();
		}
		// Render the record
		Renderer = this.Subthread.AddRecord(Record);
		this.Subthread.Render();
		this.Subthread.Container.addClass("activated");
		return Renderer;
	}
	/** ActivateSubthread: Activate a subthread. */
	public ActivateSubthread(Subthread?: SubthreadRenderer) {
		if (this.Subthread) {
			this.Subthread.Container.removeClass("activated");
			this.Subthread.DeactivateAll("activated");
		}
		if (Subthread) {
			Subthread.Container.addClass("activated");
			Subthread.Children[Subthread.Children.length - 1].ActivateSelf("activated");
		}
		this.Subthread = Subthread;
	}
	// #endregion

	// #region "Printing Support"
	/** RenderRequest: Render an offline chat request and return a new record. */
	public RenderRequest(Input?: string, Parent?: ChatRecord, FriendlyInput?: string): ChatRecord {
		var Thread = this.Tab.ChatManager.Thread;
		var Record = { Input: Input, FriendlyInput: FriendlyInput } as ChatRecord;
		var Subthread = this.Subthread?.GetData();
		Record.RequestTimestamp = Date.now();
		Record.ThreadID = Thread.ID!;
		if (!Subthread) Subthread = Thread.AddToSubthread(Record);
		Record.Language = Thread.Language;
		Record.ParentID = Parent?.ID ?? Subthread.RootID;
		Record.Response = { Sections: [], Options: [] };
		this.RenderRecord(Record, Subthread);
		return Record;
	}
	/** RenderResponses: Render response sections immediately in the current record. */
	public RenderResponses(Sections: ChatResponseSection[]) {
		if (Sections.length == 0) return;
		var LastRecord = this.Subthread!.Children[this.Subthread!.Children.length - 1] as RecordRenderer;
		for (var Section in Sections)
			LastRecord.AddSection(Sections[Section]);
		LastRecord.Render();
		this.ScrollToBottom();
	}
	/** RenderOption: Render a response option in the current record. */
	public RenderOption(Option: ChatResponseOption) {
		this.RenderOptions([Option]);
	}
	/** RenderOptions: Render response options in the current record. */
	public RenderOptions(Options: ChatResponseOption[]) {
		var LastRecord = this.Subthread!.Children[this.Subthread!.Children.length - 1] as RecordRenderer;
		LastRecord.GetData().Response.Options.push(...Options);
		LastRecord.SetDirty(true);
		this.Subthread!.Render();
	}
	// #endregion

    // #region "Printing Support"
	/** InBatch: Whether the printing is in a batch. */
	private InBatch: boolean = false;
	/** Sections: The sections in the current batch. */
	private Sections: ChatResponseSection[] = [];
	/** OpenBatch: Open a printing batch. */
	public OpenBatch() {
		if (this.InBatch && this.Sections.length > 0) this.CloseBatch();
		this.InBatch = true;
	}
	/** CloseBatch: Close a printing batch. */
	public CloseBatch() {
		this.RenderResponses(this.Sections);
		this.Sections = [];
		this.InBatch = false;
		this.ScrollToBottom();
	}
	/** RestartBatch: Restart a printing batch. */
	public RestartBatch() {
		if (!this.InBatch) return;
		this.CloseBatch();
		this.OpenBatch();
	}
	/** RenderResponse: Render response sections in the current record. */
	public QueueResponse(Section: ChatResponseSection) {
		if (this.InBatch)
			this.Sections.push(Section);
		else this.RenderResponses([Section]);
	}
	/** PrintCommandInput: Print a line of input to the screen. */
	public PrintCommandInput(Content: string, Restart: boolean = true) {
		var Parent = this.Tab.ChatManager.GetPendingParent()
		if (!Parent && Restart && !this.Subthread?.GetData().RootID) this.ActivateSubthread();
		this.RenderRequest(`\`${Content.replace("`", "\`")}\``, Parent);
	}
	/** PrintOutput: Provide for Unity to print compiled output. */ 
	public PrintOutput(Class: string, Content: any) {
		switch (Class) {
			case "CompileError":
				this.QueueResponse({
					Type: ChatResponseType.CompileError,
					Content: Localized.Get("Compile error _", Content)
				});
				break;
			case "RuntimeError":
				this.QueueResponse({
					Type: ChatResponseType.RuntimeError,
					Content: Localized.Get("Runtime error _", Content)
				});
				break;
			case "Succeeded":
				this.QueueResponse({
					Type: ChatResponseType.Finish,
					Content: Localized.Get("Successfully executed")
				});
				break;
			case "Output":
				this.QueueResponse({
					Type: ChatResponseType.Text,
					Content: Content
				});
				break;
			case "Help":
				if (typeof Content === 'string') {
					this.QueueResponse({
						Type: ChatResponseType.Text,
						Content: Content
					});
				} else if (Content instanceof Array) {
					Content.map(Source => {
						this.QueueResponse({
							Type: ChatResponseType.Text,
							Content: Source
						});
					})
				} else if (Content.parameter === "-full") {
					this.QueueResponse({
						Type: ChatResponseType.Text,
						Content: Localized.Get("Showing full text help of _", Content["display_name"])
					});
					this.Tab.FullText.ShowFullText(Content);
				} else {
					this.QueueResponse({
						Type: ChatResponseType.JSON,
						Field: "Help",
						Content: JSON.stringify(Content),
						Parsed: Content
					});
				}
				break;
			default:
				this.QueueResponse({
					Type: ChatResponseType.Text,
					Content: Content
				});
				break;
		}
	}
    // #endregion

	// #region "Welcome Message"
	/** ShowWelcome: Show the initial welcome message. */
	public ShowWelcome() {
		if (this.Subthread) return;
		// The user: How should I use this?
		this.RenderRequest(Localized.Get("Command center welcome (user)"));
		// Default options
		var Options = [
			{ Label: "Check out the code tab", Callback: () => this.Tab.Editor.EditorTabs[0].Show() },
			{ Label: "Run NetLogo code directly", Callback: () => 
				{
					if (this.Tab.Galapagos.GetCode() == "")
						this.Tab.Galapagos.SetCode("print \"Hello World!\"");
					this.Tab.Galapagos.Focus();
			 	}
			}
		];
		// AI response
		if (ChatManager.Available) {
			this.PrintOutput("Output", Localized.Get("Command center welcome (assistant)"));
			Options.push({ Label: "Talk to the computer in natural languages", Callback: () => {
				if (this.Tab.Galapagos.GetCode() == "")
					this.Tab.Galapagos.SetCode("create some turtles around");
				this.Tab.Galapagos.Focus();
			}});
		} else {
			this.PrintOutput("Output", Localized.Get("Command center welcome (command)"));
			Options.push({ Label: "Look for the documentation", Callback: () => {
				this.Tab.ExecuteCommand("observer", "help", false);
			}});
		}
		this.RenderOptions(Options);
	}
	// #endregion
}