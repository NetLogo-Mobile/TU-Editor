import { ChatManager } from "../../chat/chat-manager";
import { ChatResponseOption } from "../../chat/client/chat-option";
import { ChatRecord } from "../../chat/client/chat-record";
import { ChatResponseSection, ChatResponseType } from "../../chat/client/chat-response";
import { RecordRenderer } from "../outputs/record-renderer";
import { UIRendererOf } from "../outputs/ui-renderer";

/** SectionRenderer: A block that displays the a response section. */
export class SectionRenderer extends UIRendererOf<ChatResponseSection> {
    /** First: Whether the section is the first one. */
    protected First: boolean = false;
    /** SetFirst: Set the first status of the section. */
    public SetFirst(): SectionRenderer {
        this.First = true;
        if (!this.GetData() || this.GetData().Type != ChatResponseType.Thought)
            this.Container.addClass("first");
        return this;
    }
    /** Finalized: Whether the section is finalized. */
    protected Finalized: boolean = false;
    /** SetFinalized: Set the finalized status of the section. */
    public SetFinalized(): SectionRenderer {
        this.Finalized = true;
        return this;
    }
    /** GetRecord: Get the record of the section. */
    public GetRecord(): ChatRecord {
        return (this.Parent! as RecordRenderer).GetData()
    }
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("section");
        this.ContentContainer = this.ContentContainerInitializer().appendTo(this.Container);
    }
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement> {
        return $("<p></p>");
    }
    /** ContentContainer: The container of the contents. */
    protected ContentContainer: JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        if (this.GetData().Type == ChatResponseType.JSON && !ChatManager.ThinkProcess) {
            this.Container.remove();
            return;
        } 
        this.ContentContainer.text(`${this.GetData().Field ?? "Empty"}: ${this.GetData().Content ?? ""}`);
    }
    /** ShowPseudoOption: Show a pseudo option. */
    protected ShowPseudoOption(Option: ChatResponseOption, Callback: (Option: ChatResponseOption) => void) {
        Option.Callback = () => Callback(Option);
        var Parent = (this.Parent! as RecordRenderer);
        Parent.GetData().Response.Options!.unshift(Option);
        Parent.SetDirty(true);
    }
}