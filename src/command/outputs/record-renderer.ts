import { ChatRecord } from "../../chat/client/chat-record";
import { UIRendererOf } from "./ui-renderer";

/** RecordRenderer: A block that displays the output of a request. */
export class RecordRenderer extends UIRendererOf<ChatRecord> {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("record");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void { }
}