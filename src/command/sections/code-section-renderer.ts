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
        // Remove the first line
        var LineBreak = Code.indexOf("\n");
        if (LineBreak == -1) return;
        Code = Code.substring(LineBreak + 1);
        // Remove the last ```
        if (Code.endsWith("```"))
            Code = Code.substring(0, Code.length - 3).trimEnd();
        // Create the code block
        if (this.Finalized) {
            this.ContentContainer = this.ContentContainer.replaceWith(`<code></code>`);
            ChatManager.Instance.Commands.AnnotateCode(this.ContentContainer, Code, true);
        } else {
            this.ContentContainer = this.ContentContainer.replaceWith(`<pre></pre>`).text(Code.trim());
        }
        this.RenderOptions();
    }
}