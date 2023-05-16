import { MarkdownToHTML, PostprocessHTML } from "../../utils/element";
import { NetLogoUtils } from "../../utils/netlogo";
import { OutputDisplay } from "../displays/output";
import { SectionRenderer } from "./section-renderer";

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
        if (this.Finalized) {
            this.ContentContainer.html(MarkdownToHTML(Content));
            PostprocessHTML(OutputDisplay.Instance.Tab.Editor, this.ContentContainer);
            NetLogoUtils.AnnotateCodes(this.ContentContainer.find("code"));
        } else {
            this.ContentContainer.text(Content);
        }
        // Remove the section if it's empty
        if (Content == "" && (Section.Options?.length ?? 0) == 0 && this.Finalized)
            this.Container.remove();
    }
}