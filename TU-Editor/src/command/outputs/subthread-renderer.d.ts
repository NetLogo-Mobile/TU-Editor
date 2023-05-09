import { ChatRecord } from "../../chat/client/chat-record";
import { ChatSubthread } from "../../chat/client/chat-thread";
import { UIRendererOf } from "./ui-renderer";
import { RecordRenderer } from "./record-renderer";
import { OutputDisplay } from "../displays/outputs";
/** SubthreadRenderer: A block that displays the output of a subthread. */
export declare class SubthreadRenderer extends UIRendererOf<ChatSubthread> {
    /** Outputs: The output display. */
    private readonly Outputs;
    /** ExpandButton: The button to expand the subthread. */
    private readonly ExpandButton;
    /** Constructor: Create a new UI renderer. */
    constructor(Outputs: OutputDisplay);
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** AddRecord: Add a record to the subthread. */
    AddRecord(Record: ChatRecord): RecordRenderer;
}
