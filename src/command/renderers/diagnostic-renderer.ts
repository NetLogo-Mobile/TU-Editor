import { CodeDisplay } from '../displays/code';
import { RendererChooser } from '../outputs/record-renderer';
import { UIRendererOf } from "../outputs/ui-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
import { ChatManager } from '../../chat/chat-manager';
import { Diagnostic, DiagnosticType, Diagnostics } from "../../chat/client/languages/netlogo-context";
import { ChatResponseOption } from '../../chat/client/chat-option';
import { ExplainErrors, FixCode } from '../../chat/client/options/option-templates';
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
            for (var Diagnostic of Metadata.Diagnostics) {
                var Renderer = new DiagnosticRenderer();
                this.AddChild(Renderer, false);
                Renderer.Container.appendTo(this.ContentContainer);
                Renderer.SetData(Diagnostic);
                Renderer.Render();
            }
            NetLogoUtils.AnnotateCodes(this.ContentContainer.find("code"));
        }
        // Show the options
        this.ShowPseudoOption(ExplainErrors(Metadata.Type), (Option) => this.SubmitDiagnostics(Option, false));
        this.ShowPseudoOption(FixCode(), (Option) => this.SubmitDiagnostics(Option, true));
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
            Manager.SendMessage(JSON.stringify(Metadata.Diagnostics), 
                Option.LocalizedLabel ?? Localized.Get(Option.Label));
        } else {
            // Re-export the diagnostics from the latest code snippet
            CodeDisplay.Instance.ExportDiagnostics().then(Diagnostics =>
                Manager.SendMessage(JSON.stringify(Diagnostics.Diagnostics), 
                    Option.LocalizedLabel ?? Localized.Get(Option.Label)));
        }
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