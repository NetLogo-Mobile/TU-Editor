import { RendererChooser } from "../../command/outputs/record-renderer";
import { UIRendererOf } from "../../command/outputs/ui-renderer";
import { JSONSectionRenderer } from "../../command/sections/json-section-renderer";
import { ChatManager } from "../chat-manager";
import { Diagnostic } from "../client/languages/netlogo-context";

/** DiagnosticsRenderer: A dedicated block for code diagnostics. */
export class DiagnosticsRenderer extends JSONSectionRenderer<Diagnostic[]> {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("code-diagnostic");
    }
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement> {
        return $(`<div class="diagnostics"></div>`);
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void { 
        var Diagnostics = this.GetParsed();
        for (var Diagnostic of Diagnostics) {
            var Renderer = new DiagnosticRenderer();
            this.AddChild(Renderer, false);
            Renderer.Container.appendTo(this.ContentContainer);
            Renderer.SetData(Diagnostic);
            Renderer.Render();
        }
        var Option = this.GetRecord().Response.Options[0];
        var Link = $(`<p><a href="javascript:void(0)">${Option.LocalizedLabel ?? Option.Label}</a></p>`)
            .appendTo(this.ContentContainer).on("click", () => {
                this.SubmitDiagnostics();
                // Fixing the code is one-off. You cannot do it again.
                Link.addClass("chosen disabled").off("click");
            });
    }
    /** SubmitDiagnostics: Submit the diagnostics to the server. */
    private SubmitDiagnostics(): void {

    }
    /** GetChooser: Return the section chooser for this renderer. */
    public static GetChooser(): RendererChooser {
        return (Record, Section) => Section.Field == "Diagnostics" && Section.Parsed && Array.isArray(Section.Parsed) && Section.Parsed.length > 0 &&
            Section.Parsed[0].Message && Section.Parsed[0].Code ? new DiagnosticsRenderer() : undefined;
    }
}

/** DiagnosticRenderer: A block that displays a diagnostic. */
export class DiagnosticRenderer extends UIRendererOf<Diagnostic> {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("diagnostic");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Diagnostic = this.GetData();
    }
}