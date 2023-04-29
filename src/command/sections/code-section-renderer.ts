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
        var Code = this.Data.Content.trim();
        // Remove the first line
        var LineBreak = Code.indexOf("\n");
        if (LineBreak == -1) return;
        Code = Code.substring(LineBreak + 1);
        // Remove the last ```
        if (Code.endsWith("```"))
            Code = Code.substring(0, Code.length - 3).trimEnd();
        // Create the code block
        if (this.Finalized) {
            var Element = $(`<code></code>`).appendTo(this.Container.empty());
            this.Commands.AnnotateCode(Element, Code, true);
        } else {
            $(`<pre></pre>`).appendTo(Output).text(Code.trim());
        }
    }
}