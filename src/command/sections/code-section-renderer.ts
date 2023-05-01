import { ChatManager } from "../../chat/chat-manager";
import { SectionRenderer } from "./section-renderer";

/** CodeSectionRenderer: A block that displays the a code response section. */
export class CodeSectionRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("code");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        var Code = Section.Content?.trim() ?? "";
        if (this.Finalized) {
            this.ContentContainer = $(`<code></code>`).replaceAll(this.ContentContainer);
            ChatManager.Instance.Commands.AnnotateCode(this.ContentContainer, Code, true);
        } else {
            this.ContentContainer = $(`<pre></pre>`).replaceAll(this.ContentContainer).text(Code);
        }
    }
}