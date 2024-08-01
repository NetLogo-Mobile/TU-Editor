import { TurtleEditor } from "./main";

/** Tab: A tab in the code editor. */
export abstract class Tab {
    /** Editor: The editor instance. */
    public readonly Editor: TurtleEditor;
    /** Container: The container HTMLElement. */
    public readonly Container: HTMLElement;
    // Whether it is visible.
    public Visible: boolean = false;
    /** Constructor: Create an editor tab. */
    constructor(Container: HTMLElement, Editor: TurtleEditor) {
        this.Editor = Editor;
        this.Container = Container;
    }
    /** Show: Show the tab. */
    Show() {
        this.Editor.CurrentTab = this;
        this.Editor.HideAllTabs();
        $(this.Container).show();
        this.Visible = true;
    }
    /** Hide: Hide the tab. */
    Hide() {
        $(this.Container).hide();
        this.Visible = false;
        this.Blur();
    }
    /** Blur: Blur the tab's editor. */
    Blur() {

    }
    /** Reset: Reset the status. */
    Reset() {

    }
    /** SyncSize: Resize the visible region. */
    SyncSize() {
        this.Resize(window.visualViewport!.height, document.body.scrollHeight);
    }
    /** Resize: Resize the visible region. */
    Resize(ViewportHeight: number, ScrollHeight: number): boolean {
        $(this.Editor.Container).css("height", `${ViewportHeight}px`);
        return true;
    }
}
