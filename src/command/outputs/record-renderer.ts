import { ChatManager } from "../../chat/chat-manager";
import { ChatRecord } from "../../chat/client/chat-record";
import { ChatResponseSection, ChatResponseType } from "../../chat/client/chat-response";
import { CodeIdeationRenderer } from "../../chat/ui/code-ideation-renderer";
import { CodeSectionRenderer } from "../sections/code-section-renderer";
import { SectionRenderer } from "../sections/section-renderer";
import { ServerErrorRenderer } from "../sections/server-error-renderer";
import { TextSectionRenderer } from "../sections/text-section-renderer";
import { InputRenderer } from "./input-renderer";
import { OptionRenderer } from "./option-renderer";
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
    protected RenderInternal(): void {
        this.RenderOptions();
    }
    /** SetData: Set the data of the renderer. */
    public SetData(Data: ChatRecord) {
        this.InputRenderer.SetData(Data);
        return super.SetData(Data);
    }
    /** AddSection: Add a section to the record. */
    public AddSection(Section: ChatResponseSection): SectionRenderer | undefined {
        var Renderer: SectionRenderer | undefined;
        if (Section.Type == ChatResponseType.Thought && !ChatManager.ThinkProcess) return Renderer;
        // Choose a renderer for the section
        var Renderers = SectionRenderers[Section.Type!];
        for (var Chooser of Renderers) {
            Renderer = Chooser(this.GetData(), Section);
            if (Renderer) break;
        }
        // If no renderer was chosen, use the default renderer
        Renderer = Renderer ?? new SectionRenderer();
        // If this is the first section
        if (this.Children.length == 1) Renderer.SetFirst();
        // Add the renderer
        Renderer.SetData(Section);
        this.AddChild(Renderer, false);
        // Append to the container
        if (this.OptionContainer) {
            this.OptionContainer.before(Renderer.Container);
        } else {
            this.ContentContainer.append(Renderer.Container);
        }
        return Renderer;
    }
    /** OptionContainer: The container of the options. */
    protected OptionContainer?: JQuery<HTMLElement>;
    /** OptionRenderers: The renderer of the options. */
    protected OptionRenderers: OptionRenderer[] = [];
    /** RenderOptions: Render the options of the section. */
    protected RenderOptions() {
        var Options = this.GetData().Response?.Options;
        if (!Options || Options.length == 0) return;
        // Create the container
        this.OptionContainer = this.OptionContainer ?? $(`<ul></ul>`).addClass("options").appendTo(this.ContentContainer);
        // Render the options
        for (var I = 0; I < Options.length; I++) {
            var Option = Options[I];
            var Renderer: OptionRenderer;
            if (this.OptionRenderers.length <= I) {
                Renderer = new OptionRenderer();
                this.AddChild(Renderer, false);
                this.OptionContainer.append(Renderer.Container);
                this.OptionRenderers.push(Renderer);
            } else Renderer = this.OptionRenderers[I];
            Renderer.SetData(Option);
            Renderer.Render();
        }
    }
}

/** RendererChooser: A function that chooses a renderer for a section. */
export type RendererChooser = (Record: ChatRecord, Section: ChatResponseSection) => SectionRenderer | undefined;

/** SectionRenderers: The renderers for each section type. */
export const SectionRenderers: Record<ChatResponseType, RendererChooser[]> = {
    [ChatResponseType.Start]: [],
    [ChatResponseType.Finish]: [],
    [ChatResponseType.Text]: [() => new TextSectionRenderer()],
    [ChatResponseType.Code]: [() => new CodeSectionRenderer()],
    [ChatResponseType.JSON]: [CodeIdeationRenderer.GetChooser()],
    [ChatResponseType.Thought]: [],
    [ChatResponseType.CompileError]: [],
    [ChatResponseType.RuntimeError]: [],
    [ChatResponseType.ServerError]: [() => new ServerErrorRenderer()]
};