import { CommandTab } from "../command-tab";

/** Display: A display section of Command Center. */
export abstract class Display {
    /** Tab: The related command tab. */
    public readonly Tab: CommandTab;
    /** Container: The main container area.  */
	public readonly Container: JQuery<HTMLElement>;
	/** ScrollContainer: The scrolling container of the section. */
	public ScrollContainer: JQuery<HTMLElement>;
    // Whether it is visible.
    public Visible: boolean = false;
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab, Selector: string) {
        this.Tab = Tab;
        this.Container = $(Tab.Container).find(Selector);
        this.ScrollContainer = this.Container;
        this.Tab.Sections.push(this);
    }
    /** Show: Show the section. */
    public Show() {
		if (!this.Tab.Visible) this.Tab.Show();
        this.Tab.HideAllSections();
        $(this.Container).show();
        this.Visible = true;
    }
    /** Hide: Hide the section. */
    public Hide() {
        $(this.Container).hide();
        this.Visible = false;
    }
	/** ScrollToBottom: After user entered input, screen view should scroll down to the bottom line. */
	public ScrollToBottom() {
		this.ScrollContainer.scrollTop(this.ScrollContainer.get(0)!.scrollHeight);
	}
	/** IsAtBottom: Whether the container is scrolled to bottom. */
	public IsAtBottom(): boolean {
		var Element = this.ScrollContainer.get(0)!;
		return Math.abs(Element.scrollHeight - Element.clientHeight - Element.scrollTop) < 1;
	}
}