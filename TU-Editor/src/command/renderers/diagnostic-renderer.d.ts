/// <reference types="jquery" />
/// <reference types="jquery" />
import { RendererChooser } from '../outputs/record-renderer';
import { UIRendererOf } from "../outputs/ui-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
import { Diagnostic, Diagnostics } from "../../chat/client/languages/netlogo-context";
/** DiagnosticsRenderer: A dedicated block for code diagnostics. */
export declare class DiagnosticsRenderer extends JSONSectionRenderer<Diagnostics> {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** SubmitDiagnostics: Submit the diagnostics to the server. */
    private SubmitDiagnostics;
    /** ClipDiagnostics: Clip the diagnostics to the specified count. */
    private ClipDiagnostics;
    /** GetChooser: Return the section chooser for this renderer. */
    static GetChooser(): RendererChooser;
}
/** DiagnosticRenderer: A block that displays a diagnostic. */
export declare class DiagnosticRenderer extends UIRendererOf<Diagnostic> {
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
}
