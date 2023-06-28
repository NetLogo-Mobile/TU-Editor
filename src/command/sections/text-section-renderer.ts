import { ChatResponseSection } from "../../chat/client/chat-response";
import { MarkdownToHTML, PostprocessHTML } from "../../utils/element";
import { CopyCode } from "../../utils/misc";
import { NetLogoUtils } from "../../utils/netlogo";
import { OutputDisplay } from "../displays/output";
import { UIRendererOf } from "../outputs/ui-renderer";
import { BindCode } from "./code-section-renderer";
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
        if (Data.Field?.startsWith("__")) {
            this.Container.removeClass("first");
            this.Container.addClass(Data.Field.substring(2).toLowerCase());
        }
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
        }
        // Render the text
        this.ContentContainer.html(MarkdownToHTML(Content));
        PostprocessHTML(OutputDisplay.Instance.Tab.Editor, this.ContentContainer);
        if (this.Finalized) {
            // Find all code snippets
            var Codes = this.ContentContainer.find("code");
            var Multilines = Codes.filter((_, Element) => $(Element).text().indexOf("\n") !== -1);
            // Fix the multi-line code
            if (Multilines.length > 0) {
                var Parent = this.GetRecord().Context?.CodeSnippet;
                var ParentSnapshot = NetLogoUtils.BuildSnapshot(Parent);
                for (var Multiline of Multilines) {
                    $(Multiline).text(NetLogoUtils.FixGeneratedCode($(Multiline).text(), ParentSnapshot));
                }
                if (Multilines.length === 1) Multilines.addClass("enterable");
            }
            // Actions for the code snippets
            Codes.filter(":not(.enterable)").addClass("copyable").on("click", function() { CopyCode($(this).data("code")!); });
            BindCode.bind(this)(Codes);
            // Annotate the code snippets
            NetLogoUtils.AnnotateCodes(Codes);
        }
        // Remove the section if it's empty
        if (Content == "" && (Section.Options?.length ?? 0) == 0 && this.Finalized)
            this.Container.remove();
    }
}