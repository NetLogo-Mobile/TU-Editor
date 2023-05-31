import { ChatRecord } from "../../chat/client/chat-record";
import { ChatSubthread } from "../../chat/client/chat-thread";
import { UIRendererOf } from "./ui-renderer";
import { RecordRenderer } from "./record-renderer";
import { OutputDisplay } from "../displays/output";
import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";

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
                    .on("click", () => this.Outputs.ActivateSubthread(this, true)));
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        this.ExpandButton.toggleClass("hidden", 
            this.Children.length == 0 || (this.Children.length == 1 && this.Children[0].Children.length <= 2));
    }
    /** AddRecord: Add a record to the subthread. */
    public AddRecord(Record: ChatRecord): RecordRenderer {
        // Create the renderer.
        var Renderer = new RecordRenderer();
        Renderer.Container.insertBefore(this.ExpandButton);
        this.AddChild(Renderer, false);
        Renderer.SetData(Record);
        Renderer.ActivateSelf("activated");
        // Update the expand button.
        this.ExpandButton.find("a").text(Localized.Get("Expand messages _", this.Children.length) + " ↓");
        return Renderer;
    }
}