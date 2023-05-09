/// <reference types="jquery" />
/// <reference types="jquery" />
import { RendererChooser } from "../../command/outputs/record-renderer";
import { UIRendererOf } from "../../command/outputs/ui-renderer";
import { JSONSectionRenderer } from "../../command/sections/json-section-renderer";
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
/** ParameterRenderer: A block that displays a parameter. */
export declare class ParameterRenderer extends UIRendererOf<CodeParameter> {
    /** Question: The question mesage of the parameter. */
    Question: JQuery<HTMLElement>;
    /** Input: The content of the input. */
    Input: JQuery<HTMLElement>;
    /** Examples: The examples of the input. */
    Examples: JQuery<HTMLElement>;
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
}
/** CodeParameter: A parameter for code ideation. */
export interface CodeParameter {
    /** Name: The name of the parameter. */
    Name: string;
    /** Question: The question displayed for the user. */
    Question: string;
    /** Known: The known value of the parameter. */
    Known: string | boolean;
    /** Options: The options for the parameter. */
    Options?: string[];
}
