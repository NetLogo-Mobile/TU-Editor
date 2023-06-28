/// <reference types="jquery" />
/// <reference types="jquery" />
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
/** BindCode: Allows a code snippet to go into the full window. */
export declare function BindCode(this: SectionRenderer, Container: JQuery<HTMLElement>): JQuery<HTMLElement>;
