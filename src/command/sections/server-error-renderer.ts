import { SectionRenderer } from "./section-renderer";
declare const { EditorLocalized }: any;

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
        if (Section.Field) {
            $(`<a href="javascript:void(0)"></a>`).text(EditorLocalized.Get("Reconnect"))
                .appendTo(this.ContentContainer).on("click", Section.Field as any);
        }
    }
}