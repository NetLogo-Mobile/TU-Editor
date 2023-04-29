import { ChatRecord } from "../../chat/client/chat-record";
import { ChatSubthread } from "../../chat/client/chat-thread";
import { UIRendererOf } from "./ui-renderer";
import { RecordRenderer } from "./record-renderer";

/** SubthreadRenderer: A block that displays the output of a subthread. */
export class SubthreadRenderer extends UIRendererOf<ChatSubthread> {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("subthread");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void { }
    /** AddRecord: Add a record to the subthread. */
    public AddRecord(Record: ChatRecord): RecordRenderer {
        var Renderer = new RecordRenderer();
        Renderer.SetData(Record);
        this.AddChild(Renderer);
        Renderer.Render();
        return Renderer;
    }
}