import { TurtleEditor } from "./main";
/** Tab: A tab in the code editor. */
export declare abstract class Tab {
    /** Editor: The editor instance. */
    readonly Editor: TurtleEditor;
    /** Container: The container HTMLElement. */
    readonly Container: HTMLElement;
    Visible: boolean;
    /** Constructor: Create an editor tab. */
    constructor(Container: HTMLElement, Editor: TurtleEditor);
    /** Show: Show the tab. */
    Show(): void;
    /** Hide: Hide the tab. */
    Hide(): void;
    /** Blur: Blur the tab's editor. */
    Blur(): void;
    /** Reset: Reset the status. */
    Reset(): void;
    /** SyncSize: Resize the visible region. */
    SyncSize(): void;
    /** Resize: Resize the visible region. */
    Resize(ViewportHeight: number, ScrollHeight: number): boolean;
}
