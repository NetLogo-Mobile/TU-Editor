/// <reference types="jquery" />
/// <reference types="jquery" />
import { TurtleEditor } from "../main";
import { Tab } from '../tab';
import { FullTextDisplay } from "./displays/fulltext";
import { OutputDisplay } from "./displays/outputs";
import { ChatManager } from '../chat/chat-manager';
import { Display } from "./displays/display";
import { CodeDisplay } from "./displays/code";
import { GalapagosEditor } from "../../../CodeMirror-NetLogo/src/editor";
/** CommandTab: A tab for the command center. */
export declare class CommandTab extends Tab {
    Disabled: boolean;
    /** Galapagos: Refers to the main this.Editor. */
    readonly Galapagos: GalapagosEditor;
    /** FullText: The full-text help area. */
    readonly FullText: FullTextDisplay;
    /** Outputs: The outputs area.  */
    readonly Outputs: OutputDisplay;
    /** Codes: The interactive code area.  */
    readonly Codes: CodeDisplay;
    /** Sections: The sections of the command center. */
    readonly Sections: Display[];
    /** ChatManager: The chat interface to the backend. */
    readonly ChatManager: ChatManager;
    /** Show: Show the command tab.  */
    Show(): void;
    /** Hide: Hide the command tab. */
    Hide(): void;
    /** Blur: Blur the tab's editor. */
    Blur(): void;
    /** Resize: Resize the tab. */
    Resize(ViewportHeight: number, ScrollHeight: number): boolean;
    /** Reset: Reset the command center. */
    Reset(): void;
    /** HideAllSections: Hide all sections. */
    HideAllSections(): void;
    /** Constructor: Initialize the command center. */
    constructor(Container: HTMLElement, Editor: TurtleEditor);
    /** CommandLine: The input area.  */
    readonly CommandLine: JQuery<HTMLElement>;
    /** TargetSelect: The input area.  */
    readonly TargetSelect: JQuery<HTMLSelectElement>;
    /** CommandStack: Store the command history. */
    private CommandStack;
    /** CurrentCommand: Store the current command. */
    private CurrentCommand;
    /** CurrentCommandIndex: Store the current command index. */
    private CurrentCommandIndex;
    /** InputKeyHandler: Handle the key input. */
    private InputKeyHandler;
    /** SendCommand: Send command to either execute or as a chat message. */
    SendCommand(Objective: string, Content: string): Promise<void>;
    /** ClearInput: Clear the input box of Command Center. */
    ClearInput(): void;
    /** ShowInput: Show and enable the input box of Command Center. */
    ShowInput(): void;
    /** HideInput: Hide the input box of Command Center. */
    HideInput(): void;
    SetCode(Objective: string, Content: string): void;
    /** ExecuteInput: Execute a human-sent command. */
    private ExecuteInput;
    /** ExecuteCommand: Execute a command. */
    ExecuteCommand(Objective: string, Content: string, Restart?: boolean): void;
    /** ExplainFull: ExplainFull: Explain the selected text in the command center in full. */
    ExplainFull(Command: string): false | undefined;
    /** FinishExecution: Notify the completion of the command. */
    FinishExecution(Status: string, Message: string): void;
}
