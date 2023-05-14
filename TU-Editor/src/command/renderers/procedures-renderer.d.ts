/// <reference types="jquery" />
/// <reference types="jquery" />
import { Procedure } from "../../chat/client/languages/netlogo-context";
import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
/** ProceduresRenderer: A block that displays the a procedures section. */
export declare class ProceduresRenderer extends JSONSectionRenderer<ProcedureMetadata> {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** RenderProcedure: Render a procedure. */
    private RenderProcedure;
    /** GetChooser: Return the section chooser for this renderer. */
    static GetChooser(): RendererChooser;
}
/** ProcedureMetadata: The metadata for a procedure list. */
export interface ProcedureMetadata {
    /** Procedures: Procedures to display. */
    Procedures: Procedure[];
    /** Callback: Callback to call when a procedure is clicked. */
    Callback?: (Procedure: Procedure) => void;
    /** IsTemporary: Whether the procedures are temporary. */
    IsTemporary?: boolean;
}
