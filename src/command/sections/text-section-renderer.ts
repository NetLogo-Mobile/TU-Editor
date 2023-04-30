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
        var Content = Section.Content ?? "";
        // Filter the "output:"
        if (Content.startsWith("Output: "))
            Content = Content.substring(8).trim();
        // Render the text
        this.ContentContainer.text(Content);
        this.RenderOptions();
        // Remove the section if it's empty
        if (Content == "" && (Section.Options?.length ?? 0) == 0 && this.Finalized)
            this.Container.remove();
    }
}