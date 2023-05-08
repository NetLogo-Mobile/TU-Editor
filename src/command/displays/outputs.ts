import { RenderAgent, LinkCommand } from "../../utils/element";
import { Localized } from "../../legacy";
import { SubthreadRenderer } from "../outputs/subthread-renderer";
import { ChatSubthread } from "../../chat/client/chat-thread";
import { ChatRecord } from "../../chat/client/chat-record";
import { RecordRenderer } from "../outputs/record-renderer";
import { Display } from "./display";
import { CommandTab } from "../command-tab";
import { NetLogoUtils } from "../../utils/netlogo";
import { ChatResponseSection } from "../../chat/client/chat-response";
import { ChatResponseOption } from "../../chat/client/chat-option";

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
	public ActivateSubthread(Subthread: SubthreadRenderer) {
		if (this.Subthread) {
			this.Subthread.Container.removeClass("activated");
			this.Subthread.DeactivateAll("activated");
		}
		Subthread.Container.addClass("activated");
		Subthread.Children[Subthread.Children.length - 1].ActivateSelf("activated");
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
	/** RenderResponse: Render response sections in the current record. */
	public RenderResponse(Section: ChatResponseSection) {
		this.RenderResponses([Section]);
	}
	/** RenderResponses: Render response sections in the current record. */
	public RenderResponses(Sections: ChatResponseSection[]) {
		var LastRecord = this.Subthread!.Children[this.Subthread!.Children.length - 1] as RecordRenderer;
		for (var Section in Sections) {
			var Renderer = LastRecord.AddSection(Sections[Section]);
			Renderer?.Render();
		}
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
		LastRecord.Render();
	}
	// #endregion

    // #region "Batch Printing Support"
	/** Fragment: Batch printing support for batch printing. */
	private Fragment: JQuery<DocumentFragment> | null = null;
	/** BufferSize: Buffer size for batch printing. */
	private BufferSize = 1000;
	/** WriteOutput: Print to a batch. */
	private WriteOutput(Element: JQuery<HTMLElement>) {
		if (this.Fragment == null)
			this.ScrollContainer.append(Element);
		else this.Fragment.append(Element);
	}
	/** OpenBatch: Open a printing batch. */
	public OpenBatch() {
		this.Fragment = $(document.createDocumentFragment());
	}
	/** CloseBatch: Close a printing batch. */
	public CloseBatch() {
		if (this.Fragment == null) return;
		var AtBottom = this.IsAtBottom();
		// Trim the buffer (should refactor later) & the display
		var Length = this.Fragment.children().length;
		if (Length > this.BufferSize) {
			this.Fragment.children().slice(0, Length - this.BufferSize).remove();
			this.ScrollContainer.children().remove();
		} else {
			var NewLength = this.ScrollContainer.children().length + Length;
			if (NewLength > this.BufferSize)
                this.ScrollContainer.children().slice(0, NewLength - this.BufferSize).remove();
		}
		// Append to the display
		this.ScrollContainer.append(this.Fragment);
		this.Fragment = null;
		if (AtBottom) this.ScrollToBottom();
	}
    // #endregion

    // #region "Single Printing Support"
	/** PrintInput: Print a line of input to the screen. */
	public PrintInput(Objective: string | null, Content: string, Embedded: boolean) {
		// Change the objective
		if (Objective == null) Objective = this.Tab.TargetSelect.val() as string;
		else if (Objective != "assistant" && Objective != "you") this.Tab.TargetSelect.val(Objective);
		// CodeMirror Content
		var Wrapper = $(`
			<div class="command-wrapper">
				<div class="content">
					<p class="input Code">${Objective}&gt;&nbsp;<span></span></p>
				</div>
				<div class="icon">
					<img class="copy-icon" src="images/copy.png"/>
				</div>
			</div>
		`);
		// Standalone mode
		Wrapper.attr("objective", Objective);
		Wrapper.attr("content", Content);
		// Click to copy
		Wrapper.children(".icon").on("click", () => {
			this.Tab.SetCode(Wrapper.attr("objective")!, Wrapper.attr("content")!);
			this.Tab.Editor.Call({ Type: "ClipboardWrite", Content: `${Wrapper.attr("objective")}: ${Wrapper.attr("content")}` });
		});
		// Run CodeMirror
		NetLogoUtils.AnnotateCode(Wrapper.children(".content").children(".Code").children("span"), Content);
		if (!Embedded) this.WriteOutput(Wrapper);
		return Wrapper;
	}
	/** PrintOutput: Provide for Unity to print compiled output. */ 
	public PrintOutput(Content: any, Class: string) {
		var AtBottom = this.Fragment == null && this.IsAtBottom();
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
                    Output = $(`<p class="Output output">${Localized.Get("显示 {0} 的帮助信息。")
                        .replace("{0}", `<a class='command' target='help ${Content["display_name"]} -full'">${Content["display_name"]}</a>`)}</p>`);
					this.Tab.FullText.ShowFullText(Content);
				} else {
					Output = $(`
						<div class="block">
							<p class="${Class} output"><code>${Content["display_name"]}</code> - ${Content["agents"].map((Agent: any) => `${RenderAgent(Agent)}`).join(", ")}</p>
							<p class="${Class} output">${Content["short_description"]} (<a class='command' target='help ${Content["display_name"]} -full'">${Localized.Get("阅读全文")}</a>)</p>
							<p class="${Class} output">${Localized.Get("参见")}: ${Content["see_also"].map((Name: any) => `<a class='command' target='help ${Name}'>${Name}</a>`).join(", ")}</p>
						</div>
					`);
				}
				if (Output != null) {
					LinkCommand(Output.find("a.command"));
					this.AnnotateInput(Output.find("div.command"));
					NetLogoUtils.AnnotateCodes(Output.find("code"));
				}
				break;
			default:
				Output = $(`
					<p class="${Class} output">${Content}</p>
				`);
				break;
		}
		this.WriteOutput(Output);
		if (AtBottom) this.ScrollToBottom();
		return Output;
	}
	/** AnnotateInput: Annotate some code inputs. */ 
	private AnnotateInput(Query: JQuery<HTMLElement>) {
		Query.each((Index, Item) => {
			var Current = $(Item);
			Current.replaceWith(this.PrintInput(Current.attr("objective")!, Current.attr("target")!, true));
		});
	}
    // #endregion
}