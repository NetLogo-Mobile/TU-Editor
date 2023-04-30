import { ChatManager } from "../../chat/chat-manager";
import { SectionRenderer } from "./section-renderer";
declare const { EditorLocalized }: any;

/** TextSectionRenderer: A block that displays the a text response section. */
export class TextSectionRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("code");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        var Code = Section.Content.trim();
        // Remove the first line
        var LineBreak = Code.indexOf("\n");
        if (LineBreak == -1) return;
        Code = Code.substring(LineBreak + 1);
        // Remove the last ```
        if (Code.endsWith("```"))
            Code = Code.substring(0, Code.length - 3).trimEnd();
        // Create the code block
        if (this.Finalized) {
            var Element = this.ContentContainer.replaceWith(`<code></code>`);
            ChatManager.Instance.Commands.AnnotateCode(Element, Code, true);
        } else {
            this.ContentContainer.replaceWith(`<pre></pre>`).text(Code.trim());
        }
    }
}