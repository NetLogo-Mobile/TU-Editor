/// <reference types="jquery" />
/// <reference types="jquery" />
import { RendererChooser } from '../../command/outputs/record-renderer';
import { UIRendererOf } from "../../command/outputs/ui-renderer";
import { JSONSectionRenderer } from "../../command/sections/json-section-renderer";
import { Diagnostic } from "../client/languages/netlogo-context";
/** DiagnosticsRenderer: A dedicated block for code diagnostics. */
export declare class DiagnosticsRenderer extends JSONSectionRenderer<Diagnostic[]> {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** SubmitDiagnostics: Submit the diagnostics to the server. */
    private SubmitDiagnostics;
    /** GetChooser: Return the section chooser for this renderer. */
    static GetChooser(): RendererChooser;
}
/** DiagnosticRenderer: A block that displays a diagnostic. */
export declare class DiagnosticRenderer extends UIRendererOf<Diagnostic> {
    /** RenderedCode: The HTML rendered code. */
    private RenderedCode;
    /** Constructor: Create a new UI renderer. */
    constructor(RenderedCode: string[]);
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
}
