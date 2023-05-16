import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { SectionRenderer } from "./section-renderer";

/** ServerErrorRenderer: A block that displays the a server error section. */
export class ServerErrorRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("server-error");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        this.ContentContainer.text(Section.Content!);
        if (!Section.Parsed) return;
        $(`<a href="javascript:void(0)"></a>`).text(Localized.Get("Reconnect"))
            .appendTo(this.ContentContainer).on("click", () => {
                Section.Parsed();
                this.Parent!.RemoveChildren(Child => Child instanceof ServerErrorRenderer);
            });
    }
}