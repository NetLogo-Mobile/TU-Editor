import { ChatResponseSection } from "../../chat/client/chat-response";
import { UIRendererOf } from "../outputs/ui-renderer";

/** SectionRenderer: A block that displays the a response section. */
export class SectionRenderer extends UIRendererOf<ChatResponseSection> {
    /** First: Whether the section is the first one. */
    protected First: boolean = false;
    /** SetFirst: Set the first status of the section. */
    public SetFirst(): SectionRenderer {
        this.First = true;
        return this;
    }
    /** Finalized: Whether the section is finalized. */
    protected Finalized: boolean = false;
    /** SetFinalized: Set the finalized status of the section. */
    public SetFinalized(): SectionRenderer {
        this.Finalized = true;
        return this;
    }
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("section");
        this.ContentContainer = $(`<p></p>`).appendTo(this.Container);
    }
    /** ContentContainer: The container of the contents. */
    protected ContentContainer: JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        this.ContentContainer.text(`${this.GetData().Field ?? "Empty"}: ${this.GetData().Content ?? ""}`);
    }
}