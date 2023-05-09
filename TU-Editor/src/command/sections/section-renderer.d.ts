/// <reference types="jquery" />
/// <reference types="jquery" />
import { ChatRecord } from "../../chat/client/chat-record";
import { ChatResponseSection } from "../../chat/client/chat-response";
import { UIRendererOf } from "../outputs/ui-renderer";
/** SectionRenderer: A block that displays the a response section. */
export declare class SectionRenderer extends UIRendererOf<ChatResponseSection> {
    /** First: Whether the section is the first one. */
    protected First: boolean;
    /** SetFirst: Set the first status of the section. */
    SetFirst(): SectionRenderer;
    /** Finalized: Whether the section is finalized. */
    protected Finalized: boolean;
    /** SetFinalized: Set the finalized status of the section. */
    SetFinalized(): SectionRenderer;
    /** GetRecord: Get the record of the section. */
    GetRecord(): ChatRecord;
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement>;
    /** ContentContainer: The container of the contents. */
    protected ContentContainer: JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
}
