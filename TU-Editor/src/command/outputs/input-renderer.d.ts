import { ClientChatRequest } from "../../chat/client/chat-request";
import { UIRendererOf } from "./ui-renderer";
/** InputRenderer: A block that displays the an user input. */
export declare class InputRenderer extends UIRendererOf<ClientChatRequest> {
    /** Avatar: The avatar of the input. */
    private Avatar;
    /** Content: The content of the input. */
    private Content;
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
}
