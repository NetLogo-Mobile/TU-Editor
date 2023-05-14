/// <reference types="jquery" />
/// <reference types="jquery" />
import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
import { CodeParameter } from "./parameter-renderer";
/** ArgumentsRenderer: A dedicated block for displaying arguments. */
export declare class ArgumentsRenderer extends JSONSectionRenderer<CodeArguments> {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** SubmitArguments: Submit the arguments to execute. */
    private SubmitArguments;
    /** GetChooser: Return the section chooser for this renderer. */
    static GetChooser(): RendererChooser;
}
/** CodeArguments: A package for execution. */
export interface CodeArguments {
    /** Arguments: The arguments for the procedure. */
    Arguments: CodeParameter[];
    /** Procedure: The procedure to execute. */
    Procedure: string;
    /** Temporary: Whether the procedure is in the temporary context. */
    IsTemporary?: boolean;
}
