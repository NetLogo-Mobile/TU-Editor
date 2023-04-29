import { ChatResponseSection } from "../../chat/client/chat-response";
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
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        this.Container.text(this.Data.Content);
        this.RenderOptions();
    }
    /** RenderOptions: Render the options of the section. */
    protected RenderOptions() {
        if (!this.Data.Options) return;
        for (var Option of this.Data.Options) {
            var Link = $(`<p class="output option ${Option.Style ?? "generated"}">- <a href="javascript:void(0)"></a></p>`);
            Link.appendTo(this.Container);
            Link.find("a").data("option", Option).text(Option.LocalizedLabel ?? Option.Label)
                .on("click", function() { ChatManager.OptionHandler($(this)); });
        }
    }
}