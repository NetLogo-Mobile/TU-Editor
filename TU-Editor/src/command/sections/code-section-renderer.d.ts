import { SectionRenderer } from "./section-renderer";
/** CodeSectionRenderer: A block that displays the a code response section. */
export declare class CodeSectionRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** Code: The code of the section. */
    private Code?;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
}
/** EnterCode: Enter the code mode. */
export declare function EnterCode(this: SectionRenderer): void;
