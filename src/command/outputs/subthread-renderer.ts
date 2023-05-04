import { ChatRecord } from "../../chat/client/chat-record";
import { ChatSubthread } from "../../chat/client/chat-thread";
import { UIRendererOf } from "./ui-renderer";
import { RecordRenderer } from "./record-renderer";
import { OutputDisplay } from "../displays/outputs";
declare const { EditorLocalized }: any;

/** SubthreadRenderer: A block that displays the output of a subthread. */
export class SubthreadRenderer extends UIRendererOf<ChatSubthread> {
    /** Outputs: The output display. */
    private readonly Outputs: OutputDisplay;
    /** ExpandButton: The button to expand the subthread. */
    private readonly ExpandButton: JQuery<HTMLElement>;
    /** Constructor: Create a new UI renderer. */
    public constructor(Outputs: OutputDisplay) {
        super();
        this.Outputs = Outputs;
        this.Container.addClass("subthread");
        this.ExpandButton = $(`<div class="expand"></div>`).appendTo(this.Container)
            .append($(`<a href="javascript:void(0)"></a>`)
                    .on("click", () => this.Outputs.ActivateSubthread(this)));
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void { }
    /** AddRecord: Add a record to the subthread. */
    public AddRecord(Record: ChatRecord): RecordRenderer {
        // Create the renderer.
        var Renderer = new RecordRenderer();
        Renderer.SetData(Record);
        Renderer.Container.insertBefore(this.ExpandButton);
        this.AddChild(Renderer, false);
        Renderer.ActivateSelf("activated");
        // Update the expand button.
        this.ExpandButton.find("a").text(EditorLocalized.Get("Expand messages _", this.Children.length));
        this.ExpandButton.toggleClass("hidden", 
            this.Children.length == 1 && Record.Response.Sections.length <= 1 && Record.Response.Options.length <= 1);
        return Renderer;
    }
}