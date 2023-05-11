/// <reference types="jquery" />
/// <reference types="jquery" />
import { Procedure } from "../../chat/client/languages/netlogo-context";
import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "./json-section-renderer";
/** ProcedureSectionRenderer: A block that displays the a procedures section. */
export declare class ProcedureSectionRenderer extends JSONSectionRenderer<ProcedureMetadata> {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement>;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** ExecuteProcedure: Execute the procedure. */
    private ExecuteProcedure;
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
