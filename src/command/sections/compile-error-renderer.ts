import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { RuntimeError } from "../../../../CodeMirror-NetLogo/src/lang/linters/runtime-linter";
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
            for (var I = 0; I < Section.Parsed.length; I++) {
                var Metadata = Section.Parsed[I] as RuntimeError;
                // $("<code></code>").appendTo(this.ContentContainer).text(Metadata.Code);
                $("<li></li>").appendTo($("<ul></ul>").appendTo(this.ContentContainer)).text(Metadata.message);
            }
        } else {
            this.ContentContainer.text(Section.Content!);
        }
    }
}