import { ChatResponseSection } from "../../chat/client/chat-response";
import { OptionRenderer } from "../outputs/option-renderer";
import { UIRendererOf } from "../outputs/ui-renderer";

/** SectionRenderer: A block that displays the a response section. */
export class SectionRenderer extends UIRendererOf<ChatResponseSection> {
    /** First: Whether the section is the first one. */
    protected First: boolean = false;
    /** SetFirst: Set the first status of the section. */
    public SetFirst(): SectionRenderer {
        this.First = true;
        return this;
    }
    /** Finalized: Whether the section is finalized. */
    protected Finalized: boolean = false;
    /** SetFinalized: Set the finalized status of the section. */
    public SetFinalized(): SectionRenderer {
        this.Finalized = true;
        return this;
    }
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("section");
        this.ContentContainer = $(`<p></p>`).appendTo(this.Container);
    }
    /** ContentContainer: The container of the contents. */
    protected ContentContainer: JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        this.ContentContainer.text(`${this.GetData().Field ?? "Empty"}: ${this.GetData().Content ?? ""}`);
        this.RenderOptions();
    }
    /** OptionContainer: The container of the options. */
    protected OptionContainer?: JQuery<HTMLElement>;
    /** RenderOptions: Render the options of the section. */
    protected RenderOptions() {
        var Options = this.GetData().Options;
        if (!Options || Options.length == 0) return;
        // Create the container
        this.OptionContainer = this.OptionContainer ?? $(`<ul></ul>`).appendTo(this.Container);
        // Render the options
        for (var I = 0; I < Options.length; I++) {
            var Option = Options[I];
            var Renderer: OptionRenderer;
            if (this.Children.length <= I) {
                Renderer = new OptionRenderer();
                this.AddChild(Renderer, false);
                this.OptionContainer.append(Renderer.Container);
            } else Renderer = this.Children[I] as OptionRenderer;
            Renderer.SetData(Option);
            Renderer.Render();
        }
    }
}