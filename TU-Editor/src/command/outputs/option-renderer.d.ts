/// <reference types="jquery" />
/// <reference types="jquery" />
import { ChatResponseOption } from "../../chat/client/chat-option";
import { UIRendererOf } from "./ui-renderer";
/** OptionRenderer: A block that displays the a chat option. */
export declare class OptionRenderer extends UIRendererOf<ChatResponseOption> {
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement>;
    /** SetData: Set the data of the renderer. */
    SetData(Data: ChatResponseOption): UIRendererOf<ChatResponseOption>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** ClickHandler: The handler for the click event. */
    protected ClickHandler(): void;
}
