import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { SectionRenderer } from "./section-renderer";

/** CompileErrorRenderer: A block that displays the a compile error section. */
export class CompileErrorRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("compile-error");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        if (Section.Parsed) {
            this.ContentContainer.text(Localized.Get("Compile error in snippet _", Section.Parsed.length));
        } else {
            this.ContentContainer.text(Section.Content!);
        }
    }
}