import { ChatResponseSection } from "../../chat/client/chat-response";
import { MarkdownToHTML, PostprocessHTML } from "../../utils/element";
import { CopyCode } from "../../utils/misc";
import { NetLogoUtils } from "../../utils/netlogo";
import { OutputDisplay } from "../displays/output";
import { RecordRenderer } from "../outputs/record-renderer";
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
        var Content = (Section.Content ?? "").trim();
        // Only post-process when it is finalized & sent by AI
        if (this.Finalized && this.GetRecord().Operation) {
            Content = Content.replace(/\'([^`^\n]+?)\'/g, (Match) => {
                if (Match.length == 3 || Match.match(/\'\S /g)) return Match;
                return `\`${Match.substring(1, Match.length - 1)}\``; 
            });
            // .replace(/\n\n([^`]*?)\n\n/gs, "\n```\n$1\n```\n")
        }
        // Render the text
        this.ContentContainer.html(MarkdownToHTML(Content));
        PostprocessHTML(OutputDisplay.Instance.Tab.Editor, this.ContentContainer);
        if (this.Finalized) {
            NetLogoUtils.AnnotateCodes(this.ContentContainer.find("code")
                .on("click", function() { CopyCode($(this).data("code")!); }).addClass("copyable"));
        }
        // Remove the section if it's empty
        if (Content == "" && (Section.Options?.length ?? 0) == 0 && this.Finalized)
            this.Container.remove();
    }
}