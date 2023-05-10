import { SectionRenderer } from "./section-renderer";

/** SucceededRenderer: A block that displays the a succeeded section. */
export class SucceededRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("succeeded");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        this.ContentContainer.text(Section.Content!);
    }
}