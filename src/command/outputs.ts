import { CommandTab } from "./command-tab";
import { RenderAgent, LinkCommand } from "src/utils/element";
import { Localized } from "src/legacy";
import { SubthreadRenderer } from "./outputs/subthread-renderer";
import { ChatSubthread } from "../chat/client/chat-thread";

/** OutputDisplay: Display the output section. */
export class OutputDisplay {
    // #region "Foundational Interfaces"
    /** Tab: The related command tab. */
    public readonly Tab: CommandTab;
    /** Container: The output help area.  */
	public readonly Container: JQuery<HTMLElement>;
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab) {
        this.Tab = Tab;
        this.Container = $(Tab.Container).find(".command-output");
    }
	/** ScrollToBottom: After user entered input, screen view should scroll down to the bottom line. */
	public ScrollToBottom() {
		this.Container.scrollTop(this.Container.get(0)!.scrollHeight);
	}
	/** IsAtBottom: Whether the container is scrolled to bottom. */
	public IsAtBottom(): boolean {
		var Element = this.Container.get(0)!;
		return Math.abs(Element.scrollHeight - Element.clientHeight - Element.scrollTop) < 1;
	}
	// #endregion

	// #region "Threading Support"
	/** Subthread: The active subthread. */
	private Subthread: SubthreadRenderer;
	/** Subthreads: The subthread store. */
	private Subthreads: Map<ChatSubthread, SubthreadRenderer> = new Map<ChatSubthread, SubthreadRenderer>();
	/** Clear: Clear the output region of Command Center. */
	public Clear() {
		this.Container.remove();
		this.Subthreads.clear();
		this.Subthread = null;
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
			this.Container.append(Element);
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
			this.Container.children().remove();
		} else {
			var NewLength = this.Container.children().length + Length;
			if (NewLength > this.BufferSize)
                this.Container.children().slice(0, NewLength - this.BufferSize).remove();
		}
		// Append to the display
		this.Container.append(this.Fragment);
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
			this.Tab.SetCode(Wrapper.attr("objective"), Wrapper.attr("content"));
			this.Tab.Editor.Call({ Type: "ClipboardWrite", Content: `${Wrapper.attr("objective")}: ${Wrapper.attr("content")}` });
		});
		// Run CodeMirror
		this.Tab.AnnotateCode(Wrapper.children(".content").children(".Code").children("span"), Content, false);
		if (!Embedded) this.WriteOutput(Wrapper);
		return Wrapper;
	}
	/** PrintOutput: Provide for Unity to print compiled output. */ 
	public PrintOutput(Content, Class: string) {
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
					this.Tab.ShowFullText(Content);
				} else {
					Output = $(`
						<div class="block">
							<p class="${Class} output"><code>${Content["display_name"]}</code> - ${Content["agents"].map((Agent) => `${RenderAgent(Agent)}`).join(", ")}</p>
							<p class="${Class} output">${Content["short_description"]} (<a class='command' target='help ${Content["display_name"]} -full'">${Localized.Get("阅读全文")}</a>)</p>
							<p class="${Class} output">${Localized.Get("参见")}: ${Content["see_also"].map((Name) => `<a class='command' target='help ${Name}'>${Name}</a>`).join(", ")}</p>
						</div>
					`);
				}
				if (Output != null) {
					LinkCommand(Output.find("a.command"));
					this.AnnotateInput(Output.find("div.command"));
					this.Tab.AnnotateCode(Output.find("code"));
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
			Current.replaceWith(this.PrintInput(Current.attr("objective"), Current.attr("target"), true));
		});
	}
    // #endregion
}