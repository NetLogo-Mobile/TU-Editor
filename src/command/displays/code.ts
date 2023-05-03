import { Display } from "./display";

/** CodeDisplay: The interactive code editor section. */
export class CodeDisplay extends Display {
    /** Selector: The selector of the display. */
    public readonly Selector: string = ".command-code";
    /** Show: Show the section. */
    public Show() {
		if (!this.Tab.Visible) this.Tab.Show();
		this.Tab.Outputs.Show();
        $(this.Container).show();
        this.Visible = true;
    }
}