import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { SectionRenderer } from "./section-renderer";

/** RuntimeErrorRenderer: A block that displays the a runtime error section. */
export class RuntimeErrorRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("runtime-error");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        if (Section.Content) {
            this.ContentContainer.text(Section.Content!);
        } else {
            this.ContentContainer.text(Localized.Get("Runtime error in snippet _", Section.Parsed));
        }
    }
}