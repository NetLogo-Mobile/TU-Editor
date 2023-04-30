import { ChatManager } from "../../chat/chat-manager";
import { SectionRenderer } from "./section-renderer";
declare const { EditorLocalized }: any;

/** TextSectionRenderer: A block that displays the a text response section. */
export class TextSectionRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("text");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        var Content = Section.Content;
        // Filter the thinking process
        if (!ChatManager.ThinkProcess && 
            (Content.startsWith("Parameters:") || Content.startsWith("Thoughts:") || Content.startsWith("Input:"))) {
            var OutputIndex = Content.indexOf("\nOutput:");
            if (OutputIndex == -1) {
                if (!this.Finalized) Content = EditorLocalized.Get("I am planning for the answer...");
                else Content = "";
            } else Content = Content.substring(OutputIndex + 8).trim();
        }
        // Filter the "output:"
        if (Content.startsWith("Output: "))
            Content = Content.substring(8).trim();
        // Render the text
        this.Container.text(Content);
        // Remove the section if it's empty
        if (Content == "" && (Section.Options?.length ?? 0) == 0 && this.Finalized)
            this.Container.remove();
    }
}