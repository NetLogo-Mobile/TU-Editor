import { Localized } from "../../../dist/CodeMirror-NetLogo/src/editor";
import { Procedure } from "../../chat/client/languages/netlogo-context";
import { OutputDisplay } from "../displays/output";
import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "./json-section-renderer";

/** ProcedureSectionRenderer: A block that displays the a procedures section. */
export class ProcedureSectionRenderer extends JSONSectionRenderer<ProcedureMetadata> {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("procedures");
    }
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement> {
        return $("<ul></ul>");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        // Parse the metadata
        var Parsed = this.GetData().Parsed!;
        var Metadata: ProcedureMetadata;
        if (Array.isArray(Parsed)) {
            Metadata = { Procedures: Parsed };
        } else {
            Metadata = Parsed;
        }
        // Default callback
        Metadata.Callback = Metadata.Callback ?? 
            ((Procedure) => this.ExecuteProcedure(Procedure, Metadata.IsTemporary ?? false));
        // Render the procedures
        this.ContentContainer.empty();
        for (var Procedure of Metadata.Procedures) {
            this.RenderProcedure(this.ContentContainer, Metadata, Procedure);
        }
    }
    /** RenderProcedure: Render a procedure. */
    private RenderProcedure(Renderer: JQuery<HTMLElement>, Metadata: ProcedureMetadata, Procedure: Procedure) {
        var Renderer = $("<li></li>").appendTo(this.ContentContainer);
        $("<a></a>").appendTo(Renderer).text(`${Procedure.IsCommand ? "Command" : "Reporter"} ${Procedure.Name}`)
            .on("click", () => Metadata.Callback?.(Procedure));
        $("<span></span>").appendTo(Renderer).text(`[${Procedure.Arguments.join(" ")}]`);
    }
    /** ExecuteProcedure: Execute the procedure. */
    private ExecuteProcedure(Procedure: Procedure, IsTemporary: boolean): void {
		var Editor = OutputDisplay.Instance.Tab.Editor;
        // Check if we can really execute or not
        Editor.CheckExecution();
        // Execute the procedure
    }
    /** GetChooser: Return the section chooser for this renderer. */
    public static GetChooser(): RendererChooser {
        return (Record, Section) => Section.Field == "Procedures" && Section.Parsed && 
            (Array.isArray(Section.Parsed) || Section.Parsed.Procedures)
            ? new ProcedureSectionRenderer() : undefined;
    }
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