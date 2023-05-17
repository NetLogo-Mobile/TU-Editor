import { ChatResponseSection } from "../../chat/client/chat-response";
import { UIRendererOf } from "../outputs/ui-renderer";
import { SectionRenderer } from "./section-renderer";
/** TextSectionRenderer: A block that displays the a text response section. */
export declare class TextSectionRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** SetData: Set the data to render. */
    SetData(Data: ChatResponseSection): UIRendererOf<ChatResponseSection>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
}
