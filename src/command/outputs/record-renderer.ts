import { ChatManager } from "../../chat/chat-manager";
import { ChatRecord } from "../../chat/client/chat-record";
import { ChatResponseSection, ChatResponseType, GetField } from '../../chat/client/chat-response';
import { CodeIdeationRenderer } from "../renderers/code-ideation-renderer";
import { DiagnosticsRenderer } from "../renderers/diagnostic-renderer";
import { CodeSectionRenderer } from "../sections/code-section-renderer";
import { CompileErrorRenderer } from "../sections/compile-error-renderer";
import { HelpSectionRenderer } from "../sections/help-section-renderer";
import { ProceduresRenderer } from "../renderers/procedures-renderer";
import { RuntimeErrorRenderer } from "../sections/runtime-error-renderer";
import { SectionRenderer } from "../sections/section-renderer";
import { ServerErrorRenderer } from "../sections/server-error-renderer";
import { SucceededRenderer } from "../sections/succeeded-renderer";
import { TextSectionRenderer } from "../sections/text-section-renderer";
import { InputRenderer } from "./input-renderer";
import { OptionRenderer } from "./option-renderer";
import { UIRendererOf } from "./ui-renderer";
import { ArgumentsRenderer } from "../renderers/arguments-renderer";
import { OutputDisplay } from "../displays/output";

/** RecordRenderer: A block that displays the output of a request. */
export class RecordRenderer extends UIRendererOf<ChatRecord> {
    /** ContentContainer: The container for the content. */
    protected ContentContainer: JQuery<HTMLElement>;
    /** InputRenderer: The renderer of user inputs. */
    protected InputRenderer: InputRenderer;
    /** Processing: Whether the record is still processing. */
    public Processing: boolean = true;
    /** SetFinalized: Set the finalized status of the record. */
    public SetFinalized(Status: boolean = true): RecordRenderer {
        this.Processing = !Status;
        this.Container.toggleClass("loading", !Status);
        return this;
    }
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("record").addClass("loading");
        this.InputRenderer = new InputRenderer();
        this.AddChild(this.InputRenderer);
        var Container = $(`
<div class="contents">
    <div class="avatar"><img src="images/assistant.png" /><div class="dot-stretching"></div></div>
    <div class="content"></div>
    <div class="expand-record">︙</div>
</div>`).hide();
        Container.find(".expand-record").on("click", () => {
            this.ActivateSelf("activated");
            OutputDisplay.Instance.ScrollToElement(this.Container);
        });
        this.ContentContainer = Container.appendTo(this.Container).find(".content");
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
        // Add the renderer
        this.AddChild(Renderer, false);
        Renderer.SetData(Section);
        // If this is the first section
        if (this.Children.findIndex(Child => Child instanceof SectionRenderer && 
            Child.Container.hasClass("first")) === -1) Renderer.SetFirst();
        // Append to the container
        if (this.OptionContainer) {
            this.OptionContainer.before(Renderer.Container);
        } else {
            this.ContentContainer.append(Renderer.Container);
        }
        this.ContentContainer.parent().show();
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
    [ChatResponseType.Finish]: [() => new SucceededRenderer()],
    [ChatResponseType.Text]: [() => new TextSectionRenderer()],
    [ChatResponseType.Code]: [() => new CodeSectionRenderer()],
    [ChatResponseType.JSON]: [
        CodeIdeationRenderer.GetChooser(), 
        DiagnosticsRenderer.GetChooser(), 
        HelpSectionRenderer.GetChooser(), 
        ProceduresRenderer.GetChooser(), 
        ArgumentsRenderer.GetChooser()],
    [ChatResponseType.Thought]: [],
    [ChatResponseType.CompileError]: [() => new CompileErrorRenderer()],
    [ChatResponseType.RuntimeError]: [() => new RuntimeErrorRenderer()],
    [ChatResponseType.ServerError]: [() => new ServerErrorRenderer()]
};