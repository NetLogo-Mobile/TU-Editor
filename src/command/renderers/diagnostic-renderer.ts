import { CodeDisplay } from '../displays/code';
import { RendererChooser } from '../outputs/record-renderer';
import { UIRendererOf } from "../outputs/ui-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
import { ChatManager } from '../../chat/chat-manager';
import { Diagnostic, Diagnostics } from "../../chat/client/languages/netlogo-context";
import { ChatResponseOption } from '../../chat/client/chat-option';
import { ExplainErrors } from '../../chat/client/options/option-templates';
import { NetLogoUtils } from '../../utils/netlogo';
import { Localized } from '../../../../CodeMirror-NetLogo/src/editor';

/** DiagnosticsRenderer: A dedicated block for code diagnostics. */
export class DiagnosticsRenderer extends JSONSectionRenderer<Diagnostics> {
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
        // Render the statistics
        var Metadata = this.GetParsed();
        if (!Metadata.Hidden) {
            for (var I = 0; I < Metadata.Diagnostics.length; I++) {
                var Renderer = new DiagnosticRenderer();
                this.AddChild(Renderer, false);
                Renderer.Container.appendTo(this.ContentContainer);
                Renderer.SetData(Metadata.Diagnostics[I]);
                Renderer.Render();
            }
            NetLogoUtils.AnnotateCodes(this.ContentContainer.find("code"));
        }
        // Show the options
        if (!ChatManager.Available) return;
        this.ShowPseudoOption(ExplainErrors(Metadata.Type), 
            (Option) => this.SubmitDiagnostics(Option, false));
    }
    /** SubmitDiagnostics: Submit the diagnostics to the server. */
    private SubmitDiagnostics(Option: ChatResponseOption, Fixing: boolean): void {
        var Manager = ChatManager.Instance;
        var Metadata = this.GetParsed();
        var Record = this.GetRecord();
        // Request the option
        Manager.RequestOption(Option, Record, (Request) => 
            Request.Context!.CodeSnippet = Metadata.Code ?? CodeDisplay.Instance.Editor.GetCode());
        // Export the diagnostics
        if (Metadata.Code) {
            // Export the diagnostics from the metadata
            Manager.SendMessage(JSON.stringify(this.ClipDiagnostics(Metadata.Diagnostics, 3)), 
                Option.LocalizedLabel ?? Localized.Get(Option.Label));
        } else {
            // Re-export the diagnostics from the latest code snippet
            CodeDisplay.Instance.ExportDiagnostics().then(Diagnostics =>
                Manager.SendMessage(JSON.stringify(this.ClipDiagnostics(Diagnostics.Diagnostics, 3)), 
                    Option.LocalizedLabel ?? Localized.Get(Option.Label)));
        }
    }
    /** ClipDiagnostics: Clip the diagnostics to the specified count. */
    private ClipDiagnostics(Diagnostics: Diagnostic[], Count: number): Diagnostic[] {
        if (Diagnostics.length <= Count) return Diagnostics;
        var Clipped: Diagnostic[] = [];
        for (var I = 0; I < Count; I++) Clipped.push(Diagnostics[I]);
        return Clipped;
    }
    /** GetChooser: Return the section chooser for this renderer. */
    public static GetChooser(): RendererChooser {
        return (Record, Section) => Section.Field == "Diagnostics" && Section.Parsed && 
            Section.Parsed.Diagnostics ? new DiagnosticsRenderer() : undefined;
    }
}

/** DiagnosticRenderer: A block that displays a diagnostic. */
export class DiagnosticRenderer extends UIRendererOf<Diagnostic> {
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement> {
        return $(`<li></li>`);
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Diagnostic = this.GetData();
        if (Diagnostic.Code)
            $("<code></code>").appendTo(this.Container).text(Diagnostic.Code);
        $(`<div class="message"></div>`).text(Diagnostic.Message).appendTo(this.Container);
    }
}