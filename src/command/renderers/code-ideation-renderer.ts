import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
import { ChatManager } from "../../chat/chat-manager";
import { CodeParameter, ParameterRenderer } from "./parameter-renderer";

/** CodeIdeationRenderer: A dedicated block for code ideation. */
export class CodeIdeationRenderer extends JSONSectionRenderer<CodeParameter[]> {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("code-ideation");
    }
    /** ContentContainerInitializer: The initializer for the container. */
    protected ContentContainerInitializer(): JQuery<HTMLElement> {
        return $("<ul></ul>");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void { 
        var Parameters = this.GetParsed();
        if (this.Finalized) {
            this.ContentContainer = $(`<div class="parameters"></div>`).replaceAll(this.ContentContainer);
            // When finalized, render the entire HTML structure
            for (var Parameter of Parameters) {
                var Renderer = new ParameterRenderer();
                this.AddChild(Renderer, false);
                Renderer.Container.appendTo(this.ContentContainer);
                Renderer.SetData(Parameter);
                Renderer.Render();
            }
            var Option = this.GetRecord().Response.Options[0];
            var Link = $(`<p>👍<a href="javascript:void(0)">${Option.LocalizedLabel ?? Option.Label}</a></p>`)
                .appendTo(this.ContentContainer).on("click", () => {
                    this.SubmitParameters();
                    Link.addClass("chosen");
                });
        } else if (Parameters) {
            this.ContentContainer.empty();
            // When not finalized, render the questions
            for (var Parameter of Parameters) {
                $("<li></li>").appendTo(this.ContentContainer).text(Parameter.Question ?? Parameter.Name);
            }
        }
    }
    /** SubmitParameters: Submit the parameters to the server. */
    private SubmitParameters(): void {
        // Compose the input
        var Composed: Record<string, any> = {};
        this.Children.forEach(Renderer => {
            var Current = Renderer as ParameterRenderer;
            var Result = Current.GetOutput(true)!;
            if (Result[1] !== "" && Result[1].toLowerCase() !== "default")
                Composed[Result[0]] = Result[1];
        });
        // Request the virtual option
        var Manager = ChatManager.Instance;
        var Record = this.GetRecord();
        // Get the complexity
        var Complexity = parseInt(Record.Response.Sections.find(Section => Section.Field == "Complexity")?.Content ?? "4");
        Record.Response.Options[0].Operation = Complexity >= 4 ? "Plan" : "CodeCompose";
        if (!Manager.RequestOption(Record.Response.Options[0], Record)) return;
        // Build the server message
        var Need = Record.Response.Sections.find(Section => Section.Field == "Need")?.Content ?? "Unknown";
        var Message = JSON.stringify({
            Need: Need,
            Details: Composed
        });
        // Build the friendly message
        var Friendly = `*${Localized.Get("Need")}*: ${Need}`;
        for (var Parameter in Composed) {
            Friendly += `\n- ${Parameter} **${Composed[Parameter]}**`;
        }
        Manager.SendMessage(Message, Friendly);
    }
    /** GetChooser: Return the section chooser for this renderer. */
    public static GetChooser(): RendererChooser {
        return (Record, Section) => Section.Field == "Parameters" && Section.Content?.startsWith("[") ? new CodeIdeationRenderer() : undefined;
    }
}