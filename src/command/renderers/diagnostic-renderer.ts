import { CodeDisplay } from '../displays/code';
import { RecordRenderer, RendererChooser } from '../outputs/record-renderer';
import { UIRendererOf } from "../outputs/ui-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
import { ChatManager } from '../../chat/chat-manager';
import { Diagnostic } from "../../chat/client/languages/netlogo-context";

/** DiagnosticsRenderer: A dedicated block for code diagnostics. */
export class DiagnosticsRenderer extends JSONSectionRenderer<Diagnostic[]> {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("code-diagnostic");
    }
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement> {
        return $(`<ul class="diagnostics"></ul>`);
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void { 
        // For now, we don't render the diagnostics
        var Record = this.GetRecord();
        /*var Rendered = Record.Response.Sections.find((Section) => Section.Field == "HTML")!.Content?.split("\n") ?? [];
        var Diagnostics = this.GetParsed();
        for (var Diagnostic of Diagnostics) {
            var Renderer = new DiagnosticRenderer(Rendered);
            this.AddChild(Renderer, false);
            Renderer.Container.appendTo(this.ContentContainer);
            Renderer.SetData(Diagnostic);
            Renderer.Render();
        }*/
        // Show the option
        var Option = Record.Response.Options[0];
        var Link = $(`<li><a href="javascript:void(0)">${Option.LocalizedLabel ?? Option.Label}</a></li>`)
            .appendTo(this.ContentContainer).on("click", () => {
                this.SubmitDiagnostics();
                Link.addClass("chosen");
            });
    }
    /** SubmitDiagnostics: Submit the diagnostics to the server. */
    private SubmitDiagnostics(): void {
        var Manager = ChatManager.Instance;
        var Record = this.GetRecord();
        var Option = Record.Response.Options[0];
        Manager.RequestOption(Option, Record, (Request) => 
            Request.Context!.CodeSnippet = CodeDisplay.Instance.Editor.GetCode());
        CodeDisplay.Instance.ExportDiagnostics().then(Diagnostics =>
            Manager.SendMessage(JSON.stringify(Diagnostics), Option.LocalizedLabel ?? Option.Label))
    }
    /** GetChooser: Return the section chooser for this renderer. */
    public static GetChooser(): RendererChooser {
        return (Record, Section) => Section.Field == "Diagnostics" && Section.Parsed && Array.isArray(Section.Parsed) && Section.Parsed.length > 0 &&
            Section.Parsed[0].Message && Section.Parsed[0].Code ? new DiagnosticsRenderer() : undefined;
    }
}

/** DiagnosticRenderer: A block that displays a diagnostic. */
export class DiagnosticRenderer extends UIRendererOf<Diagnostic> {
    /** RenderedCode: The HTML rendered code. */
    private RenderedCode: string[];
    /** Constructor: Create a new UI renderer. */
    public constructor(RenderedCode: string[]) {
        super();
        this.RenderedCode = RenderedCode;
    }
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement> {
        return $(`<li></li>`);
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Diagnostic = this.GetData();
        $(`<div class="message"></div>`).text(Diagnostic.Message).appendTo(this.Container);
    }
}