import { SectionRenderer } from "./section-renderer";
/** JSONSectionRenderer: A block that displays the a JSON response section. */
export declare class JSONSectionRenderer<T> extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** GetParsed: Get the parsed data. */
    protected GetParsed(): T;
}
