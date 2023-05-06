import { CommandTab } from "../command-tab";
import { Display } from "./display";
import { GalapagosEditor } from "../../../../CodeMirror-NetLogo/src/editor"
import { ParseMode } from "../../../../CodeMirror-NetLogo/src/editor-config";
import { NetLogoUtils } from "../../utils/netlogo";

/** CodeDisplay: The interactive code editor section. */
export class CodeDisplay extends Display {
	/** Editor: The editor instance. */
	public Editor: GalapagosEditor;
	/** Constructor: Create a new output section. */
	public constructor(Tab: CommandTab) {
		super(Tab, ".command-code"); 
		// Create the shared editor if necessary
		if (!NetLogoUtils.SharedEditor) {
			NetLogoUtils.SharedEditor = new GalapagosEditor(this.Container.find(".hidden-editor").get(0)!, {
				ParseMode: ParseMode.Generative
			});
			this.Tab.Editor.EditorTabs[0].Galapagos.AddChild(NetLogoUtils.SharedEditor);
		}
		// Create the editor
		this.Editor = new GalapagosEditor(this.Container.find(".codemirror").get(0)!, {
			Wrapping: true,
			ParseMode: ParseMode.Generative
		});
		this.Tab.Editor.EditorTabs[0].Galapagos.AddChild(this.Editor);
	}
    /** Show: Show the section. */
    public Show() {
		if (!this.Tab.Visible) this.Tab.Show();
		this.Tab.Outputs.Show();
        $(this.Container).show();
        this.Visible = true;
    }
}