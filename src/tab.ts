import { TurtleEditor } from "./main";

/** Tab: A tab in the code editor. */
export class Tab {
    /** Editor: The editor instance. */
    public readonly Editor: TurtleEditor;
    /** Container: The container HTMLElement. */
    public readonly Container: HTMLElement;
	// Whether it is visible.
	public Visible: boolean;
    /** Constructor: Create an editor tab. */
    constructor(Container: HTMLElement, Editor: TurtleEditor) {
        this.Editor = Editor;
        this.Container = Container;
    }
    /** Show: Show the tab. */
    Show() {
        this.Editor.CurrentTab = this;
        this.Editor.HideAllTabs();
        this.Container.style.display = "block";
        this.Visible = true;
        this.SyncSize();
    }
    /** Hide: Hide the tab. */
    Hide() {
        this.Container.style.display = "none";
        this.Visible = false;
    }
    /** Blur: Blur the tab's editor. */
    Blur() {

    }
    /** Reset: Reset the status. */
    Reset() {

    }
    /** SyncSize: Resize the visible region. */
    SyncSize() {
        this.Resize(window.visualViewport.height, document.body.scrollHeight);
    }
    /** Resize: Resize the visible region. */
    Resize(ViewportHeight: number, ScrollHeight: number): boolean {
		if (navigator.userAgent.indexOf("Macintosh") == -1 && navigator.userAgent.indexOf("Mac OS X") == -1) {
			$(this.Editor.Container).css("height", `${ViewportHeight}px`);
            return true;
        }
    }
}