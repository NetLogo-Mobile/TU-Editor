/// <reference types="jquery" />
/// <reference types="jquery" />
import { ChatRecord } from "../../chat/client/chat-record";
import { ChatResponseSection, ChatResponseType } from '../../chat/client/chat-response';
import { SectionRenderer } from "../sections/section-renderer";
import { InputRenderer } from "./input-renderer";
import { OptionRenderer } from "./option-renderer";
import { UIRendererOf } from "./ui-renderer";
/** RecordRenderer: A block that displays the output of a request. */
export declare class RecordRenderer extends UIRendererOf<ChatRecord> {
    /** ContentContainer: The container for the content. */
    protected ContentContainer: JQuery<HTMLElement>;
    /** InputRenderer: The renderer of user inputs. */
    protected InputRenderer: InputRenderer;
    /** Processing: Whether the record is still processing. */
    Processing: boolean;
    /** SetFinalized: Set the finalized status of the record. */
    SetFinalized(Status?: boolean): RecordRenderer;
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** SetData: Set the data of the renderer. */
    SetData(Data: ChatRecord): UIRendererOf<ChatRecord>;
    /** AddSection: Add a section to the record. */
    AddSection(Section: ChatResponseSection): SectionRenderer | undefined;
    /** OptionContainer: The container of the options. */
    protected OptionContainer?: JQuery<HTMLElement>;
    /** OptionRenderers: The renderer of the options. */
    protected OptionRenderers: OptionRenderer[];
    /** RenderOptions: Render the options of the section. */
    protected RenderOptions(): void;
}
/** RendererChooser: A function that chooses a renderer for a section. */
export type RendererChooser = (Record: ChatRecord, Section: ChatResponseSection) => SectionRenderer | undefined;
/** SectionRenderers: The renderers for each section type. */
export declare const SectionRenderers: Record<ChatResponseType, RendererChooser[]>;
