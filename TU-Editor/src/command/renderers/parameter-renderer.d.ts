/// <reference types="jquery" />
/// <reference types="jquery" />
import { UIRendererOf } from "../outputs/ui-renderer";
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
    /** GetOutput: Return the output of the parameter. */
    GetOutput(AllowEmpty?: boolean): [string, string] | null;
}
/** CodeParameter: A parameter for code ideation. */
export interface CodeParameter {
    /** Name: The name of the parameter. */
    Name: string;
    /** Question: The question displayed for the user. */
    Question?: string;
    /** Known: The known value of the parameter. */
    Known?: string | boolean;
    /** Examples: The examples for the parameter. */
    Examples?: string[];
}
