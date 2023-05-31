import { SubthreadRenderer } from "../outputs/subthread-renderer";
import { ChatSubthread } from "../../chat/client/chat-thread";
import { ChatRecord } from "../../chat/client/chat-record";
import { RecordRenderer } from "../outputs/record-renderer";
import { Display } from "./display";
import { CommandTab } from "../command-tab";
import { ChatResponseSection } from "../../chat/client/chat-response";
import { ChatResponseOption } from "../../chat/client/chat-option";
import { RuntimeError } from "../../../../CodeMirror-NetLogo/src/lang/linters/runtime-linter";
/** OutputDisplay: Display the output section. */
export declare class OutputDisplay extends Display {
    /** Instance: The singleton instance. */
    static Instance: OutputDisplay;
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab);
    /** Subthread: The active subthread. */
    Subthread?: SubthreadRenderer;
    /** Subthreads: The subthread store. */
    private Subthreads;
    /** Show: Show the output region of Command Center. */
    Show(): void;
    /** Clear: Clear the output region of Command Center. */
    Clear(): void;
    /** RenderRecord: Render a new chat record. */
    RenderRecord(Record: ChatRecord, Subthread: ChatSubthread): RecordRenderer;
    /** ActivateSubthread: Activate a subthread. */
    ActivateSubthread(Subthread?: SubthreadRenderer, Expanding?: boolean): void;
    /** RenderRequest: Render an offline chat request and return a new record. */
    RenderRequest(Input?: string, Parent?: ChatRecord, FriendlyInput?: string): RecordRenderer;
    /** RenderResponses: Render response sections immediately in the current record. */
    RenderResponses(Sections: ChatResponseSection[], Finalizing: boolean): void;
    /** RenderOption: Render a response option in the current record. */
    RenderOption(Option: ChatResponseOption): void;
    /** RenderOptions: Render response options in the current record. */
    RenderOptions(Options: ChatResponseOption[]): void;
    /** InBatch: Whether the printing is in a batch. */
    private InBatch;
    /** Sections: The sections in the current batch. */
    private Sections;
    /** OpenBatch: Open a printing batch. */
    OpenBatch(): void;
    /** CloseBatch: Close a printing batch. */
    CloseBatch(): void;
    /** RestartBatch: Restart a printing batch. */
    RestartBatch(): void;
    /** QueueResponse: Quere a response section */
    QueueResponse(Section: ChatResponseSection): void;
    /** PrintCommandInput: Print a line of input to the screen. */
    PrintCommandInput(Content: string, Restart?: boolean): ChatRecord;
    /** FinishExecution: Notify the completion of the command. */
    FinishExecution(Status: string, Code: string, Message: any | RuntimeError[]): void;
    /** PrintOutput: Provide for Unity to print compiled output. */
    PrintOutput(Class: string, Content: any): void;
    /** ShowWelcome: Show the initial welcome message. */
    ShowWelcome(): void;
}
