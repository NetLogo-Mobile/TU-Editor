/// <reference types="jquery" />
/// <reference types="jquery" />
import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
import { CodeParameter } from "./parameter-renderer";
/** CodeIdeationRenderer: A dedicated block for code ideation. */
export declare class CodeIdeationRenderer extends JSONSectionRenderer<CodeParameter[]> {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** SubmitParameters: Submit the parameters to the server. */
    private SubmitParameters;
    /** GetChooser: Return the section chooser for this renderer. */
    static GetChooser(): RendererChooser;
}
