import { ChatRecord } from "../../chat/client/chat-record";
import { ChatResponseSection, ChatResponseType } from "../../chat/client/chat-response";
import { CodeSectionRenderer } from "../sections/code-section-renderer";
import { SectionRenderer } from "../sections/section-renderer";
import { TextSectionRenderer } from "../sections/text-section-renderer";
import { InputRenderer } from "./input-renderer";
import { UIRendererOf } from "./ui-renderer";

/** RecordRenderer: A block that displays the output of a request. */
export class RecordRenderer extends UIRendererOf<ChatRecord> {
    /** ContentContainer: The container for the content. */
    protected ContentContainer: JQuery<HTMLElement>;
    /** InputRenderer: The renderer of user inputs. */
    protected InputRenderer: InputRenderer;
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("record");
        this.InputRenderer = new InputRenderer();
        this.AddChild(this.InputRenderer);
        this.ContentContainer = $(`
<div class="contents">
    <div class="avatar"><img src="images/assistant.png" /></div>
    <div class="content"></div>
</div>`).appendTo(this.Container).find(".content");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void { }
    /** SetData: Set the data of the renderer. */
    public SetData(Data: ChatRecord) {
        this.InputRenderer.SetData(Data);
        return super.SetData(Data);
    }
    /** AddSection: Add a section to the record. */
    public AddSection(Section: ChatResponseSection): SectionRenderer {
        var Renderer: SectionRenderer | undefined;
        // Choose a renderer for the section
        var Renderers = SectionRenderers[Section.Type!];
        for (var Chooser of Renderers) {
            Renderer = Chooser(Section);
            if (Renderer) break;
        }
        // If no renderer was chosen, use the default renderer
        Renderer = Renderer ?? new SectionRenderer();
        // If this is the first section
        if (this.Children.length == 1) Renderer.SetFirst();
        // Add the renderer
        Renderer.SetData(Section);
        this.AddChild(Renderer, false);
        this.ContentContainer.append(Renderer.Container);
        return Renderer;
    }
}

/** RendererChooser: A function that chooses a renderer for a section. */
export type RendererChooser = (Section: ChatResponseSection) => SectionRenderer | undefined;

/** SectionRenderers: The renderers for each section type. */
export const SectionRenderers: Record<ChatResponseType, RendererChooser[]> = {
    [ChatResponseType.Start]: [],
    [ChatResponseType.Finish]: [],
    [ChatResponseType.Text]: [() => new TextSectionRenderer()],
    [ChatResponseType.Code]: [() => new CodeSectionRenderer()],
    [ChatResponseType.JSON]: [],
    [ChatResponseType.Thought]: [],
    [ChatResponseType.CompileError]: [],
    [ChatResponseType.RuntimeError]: [],
    [ChatResponseType.ServerError]: []
};