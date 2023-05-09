/// <reference types="jquery" />
import { SubthreadRenderer } from "../outputs/subthread-renderer";
import { ChatSubthread } from "../../chat/client/chat-thread";
import { ChatRecord } from "../../chat/client/chat-record";
import { RecordRenderer } from "../outputs/record-renderer";
import { Display } from "./display";
import { CommandTab } from "../command-tab";
import { ChatResponseSection } from "../../chat/client/chat-response";
import { ChatResponseOption } from "../../chat/client/chat-option";
/** OutputDisplay: Display the output section. */
export declare class OutputDisplay extends Display {
    /** Instance: The singleton instance. */
    static Instance: OutputDisplay;
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab);
    /** Subthread: The active subthread. */
    private Subthread?;
    /** Subthreads: The subthread store. */
    private Subthreads;
    /** Show: Show the output region of Command Center. */
    Show(): void;
    /** Clear: Clear the output region of Command Center. */
    Clear(): void;
    /** RenderRecord: Render a new chat record. */
    RenderRecord(Record: ChatRecord, Subthread: ChatSubthread): RecordRenderer;
    /** ActivateSubthread: Activate a subthread. */
    ActivateSubthread(Subthread: SubthreadRenderer): void;
    /** RenderRequest: Render an offline chat request and return a new record. */
    RenderRequest(Input?: string, Parent?: ChatRecord, FriendlyInput?: string): ChatRecord;
    /** RenderResponse: Render response sections in the current record. */
    RenderResponse(Section: ChatResponseSection): void;
    /** RenderResponses: Render response sections in the current record. */
    RenderResponses(Sections: ChatResponseSection[]): void;
    /** RenderOption: Render a response option in the current record. */
    RenderOption(Option: ChatResponseOption): void;
    /** RenderOptions: Render response options in the current record. */
    RenderOptions(Options: ChatResponseOption[]): void;
    /** Fragment: Batch printing support for batch printing. */
    private Fragment;
    /** BufferSize: Buffer size for batch printing. */
    private BufferSize;
    /** WriteOutput: Print to a batch. */
    private WriteOutput;
    /** OpenBatch: Open a printing batch. */
    OpenBatch(): void;
    /** CloseBatch: Close a printing batch. */
    CloseBatch(): void;
    /** PrintInput: Print a line of input to the screen. */
    PrintInput(Objective: string | null, Content: string, Embedded: boolean): JQuery<HTMLElement>;
    /** PrintOutput: Provide for Unity to print compiled output. */
    PrintOutput(Content: any, Class: string): JQuery<HTMLElement>;
    /** AnnotateInput: Annotate some code inputs. */
    private AnnotateInput;
}
