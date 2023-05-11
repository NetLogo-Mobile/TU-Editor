import { TurtleEditor } from "../main";
import { Tab } from "../tab";
import { GalapagosEditor } from "../../../CodeMirror-NetLogo/src/editor";
/** EditorTab: A tab for the code editor. */
export declare class EditorTab extends Tab {
    /** Galapagos: Refers to the main editor.  */
    readonly Galapagos: GalapagosEditor;
    /** Show: Show the editor tab.  */
    Show(): void;
    /** Hide: Hide the editor tab.  */
    Hide(): void;
    /** Blur: Blur the tab's editor. */
    Blur(): void;
    /** Resize: Resize the tab. */
    private TimeoutHandler;
    Resize(ViewportHeight: number, ScrollHeight: number): boolean;
    /** Constructor: Initialize the editor. */
    constructor(Container: HTMLElement, Editor: TurtleEditor);
    /** TipsElement: The HTML element for tips. */
    private TipsElement;
    ShowTips(Content: string, Callback?: () => void): void;
    HideTips(): void;
    private IgnoreUpdate;
    /** CodeRefreshed: Did we refresh the code on the background? */
    private CodeRefreshed;
    /** SetCode: Set the content of the this. */
    SetCode(Content: string, Unapplied: boolean): void;
    /** GetCode: Get the content of the this. */
    GetCode(): string;
    /** SetApplied: Set applied status. */
    SetApplied(): void;
    /** JumpToNetTango: Jump to the NetTango portion. */
    JumpToNetTango(): void;
    /** ResetCode: Show the reset dialog. */
    ResetCode(): void;
    /** ShowMenu: Show a feature menu. */
    ShowMenu(): void;
    /** ShowProcedures: List all procedures in the code. */
    ShowProcedures(): void;
    /** GetProcedures: Get all procedures from the code. */
    GetProcedures(): Record<string, [number, number]>;
}
