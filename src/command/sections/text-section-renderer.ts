import { ChatResponseSection } from "../../chat/client/chat-response";
import { MarkdownToHTML, PostprocessHTML } from "../../utils/element";
import { NetLogoUtils } from "../../utils/netlogo";
import { OutputDisplay } from "../displays/output";
import { UIRendererOf } from "../outputs/ui-renderer";
import { SectionRenderer } from "./section-renderer";

/** TextSectionRenderer: A block that displays the a text response section. */
export class TextSectionRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("text");
    }
    /** SetData: Set the data to render. */
    public SetData(Data: ChatResponseSection): UIRendererOf<ChatResponseSection> {
        if (Data.Field?.startsWith("__"))
            this.Container.removeClass("first");
        return super.SetData(Data);
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        var Content = Section.Content ?? "";
        // Render the text
        this.ContentContainer.html(MarkdownToHTML(Content));
        PostprocessHTML(OutputDisplay.Instance.Tab.Editor, this.ContentContainer);
        if (this.Finalized)
            NetLogoUtils.AnnotateCodes(this.ContentContainer.find("code"));
        // Remove the section if it's empty
        if (Content == "" && (Section.Options?.length ?? 0) == 0 && this.Finalized)
            this.Container.remove();
    }
}