import { SectionRenderer } from "./section-renderer";

/** JSONSectionRenderer: A block that displays the a JSON response section. */
export class JSONSectionRenderer<T> extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("json");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void { }
    /** GetParsed: Get the parsed data. */
    protected GetParsed(): T {
        return super.GetData().Parsed as T;
    }
}