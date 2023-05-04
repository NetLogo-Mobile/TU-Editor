import { CommandTab } from "../command-tab";

/** Display: A display section of Command Center. */
export class Display {
    /** Tab: The related command tab. */
    public readonly Tab: CommandTab;
    /** Container: The output help area.  */
	public readonly Container: JQuery<HTMLElement>;
    // Whether it is visible.
    public Visible: boolean = false;
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab) {
        this.Tab = Tab;
        this.Container = $(Tab.Container).find(".command-output");
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
		this.Container.scrollTop(this.Container.get(0)!.scrollHeight);
	}
	/** IsAtBottom: Whether the container is scrolled to bottom. */
	public IsAtBottom(): boolean {
		var Element = this.Container.get(0)!;
		return Math.abs(Element.scrollHeight - Element.clientHeight - Element.scrollTop) < 1;
	}
}