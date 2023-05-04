import { CommandTab } from "../command-tab";
import { Display } from "./display";

/** CodeDisplay: The interactive code editor section. */
export class CodeDisplay extends Display {
	/** Constructor: Create a new output section. */
	public constructor(Tab: CommandTab) {
		super(Tab, ".command-code");
	}
    /** Show: Show the section. */
    public Show() {
		if (!this.Tab.Visible) this.Tab.Show();
		this.Tab.Outputs.Show();
        $(this.Container).show();
        this.Visible = true;
    }
}