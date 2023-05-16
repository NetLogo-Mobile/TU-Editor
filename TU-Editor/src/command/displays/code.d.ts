import { CommandTab } from "../command-tab";
import { Display } from "./display";
import { GalapagosEditor } from "../../../../CodeMirror-NetLogo/src/editor";
import { ChatRecord } from "../../chat/client/chat-record";
import { SubthreadRenderer } from "../outputs/subthread-renderer";
import { Diagnostic } from "../../chat/client/languages/netlogo-context";
/** CodeDisplay: The interactive code editor section. */
export declare class CodeDisplay extends Display {
    /** Editor: The editor instance. */
    Editor: GalapagosEditor;
    /** Instance: The singleton instance. */
    static Instance: CodeDisplay;
    /** ReturnButton: The return button of the display. */
    private ReturnButton;
    /** PlayButton: The play button of the display. */
    private PlayButton;
    /** FixButton: The fix button of the display. */
    /** AskButton: The ask button of the display. */
    private AskButton;
    /** AddToCodeButton: The add to code button of the display. */
    private AddToCodeButton;
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab);
    /** Show: Show the section. */
    Show(): void;
    /** Hide: Hide the section. */
    Hide(): void;
    /** Subthread: The related subthread. */
    private Subthread?;
    /** Record: The related record. */
    private Record?;
    /** Records: The records that contains code sections. */
    private Records;
    /** CurrentIndex: The current code index of the display. */
    private CurrentIndex;
    /** PreviousButton: The previous button of the display. */
    private PreviousButton;
    /** NextButton: The next button of the display. */
    private NextButton;
    /** HistoryDisplay: The label of the history. */
    private HistoryDisplay;
    /** UpdateHistory: Update the history index of the display. */
    private UpdateHistory;
    /** UpdateRecords: Update the records. */
    private UpdateRecords;
    /** Return: Leave the mode immediately. */
    private Return;
    /** ShowPrevious: Show the previous code section. */
    private ShowPrevious;
    /** ShowNext: Show the next code section. */
    private ShowNext;
    /** SetContext: Set the context of the code display. */
    SetContext(Record: ChatRecord, Subthread: SubthreadRenderer): void;
    /** SaveChanges: Save the changes of the current code section. */
    private SaveChanges;
    /** TryTo: Try to do something that requires grammatically correct code. */
    TryTo(Action: () => void): void;
    /** Fix: Try to fix the code. */
    ExportDiagnostics(): Promise<Diagnostic[]>;
    /** Play: Try to play the code. */
    Play(): void;
    /** PlayProcedures: Try to play the available procedures after compilation. */
    private PlayProcedures;
    /** AddToCode: Add the code to the main editor. */
    AddToCode(): void;
    /** Ask: Try to ask about the code. */
    Ask(): void;
    /** SendRequest: Send a request to the server. */
    private SendRequest;
}
