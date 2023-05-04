import { RecordRenderer, RendererChooser } from "../../command/outputs/record-renderer";
import { UIRendererOf } from "../../command/outputs/ui-renderer";
import { JSONSectionRenderer } from "../../command/sections/json-section-renderer";
import { ChatManager } from "../chat-manager";
declare const { EditorLocalized }: any;

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
            $(`<p><a href="javascript:void(0)">${EditorLocalized.Get("I think that's what I want, for now...")}</a></p>`)
                .appendTo(this.ContentContainer).on("click", () => this.SubmitParameters());
        } else {
            this.ContentContainer.empty();
            // When not finalized, render the questions
            for (var Parameter of Parameters) {
                $("<li></li>").appendTo(this.ContentContainer).text(Parameter.Question);
            }
        }
    }
    /** SubmitParameters: Submit the parameters to the server. */
    private SubmitParameters(): void {
        // Compose the input
        var Composed: Record<string, any> = {};
        this.Children.forEach(Renderer => {
            var Current = Renderer as ParameterRenderer;
            var Parameter = Current.GetData();
            var Value = Current.Input.val();
            if (!Value || Value === "") Value = Current.Input.attr("placeholder");
            Composed[Parameter.Name] = Value;
        });
        // Request the virtual option
        var Manager = ChatManager.Instance;
        var Record = (this.Parent! as RecordRenderer).GetData();
        Manager.RequestOption(Record.Response.Options[0], Record);
        // Build the messages
        var Message = JSON.stringify({
            Need: Record.Response.Sections[0].Content,
            Parameters: Composed
        });
        var Friendly = `${EditorLocalized.Get("Here is a summary of my request:")}`;
        for (var Parameter in Composed) {
            Friendly += `\n- ${Parameter}: ${Composed[Parameter]}`;
        }
        console.log(Message);
        Manager.SendMessage(Message, Friendly);
    }
    /** GetChooser: Return the section chooser for this renderer. */
    public static GetChooser(): RendererChooser {
        return (Record, Section) => Section.Parsed && Array.isArray(Section.Parsed) && Section.Parsed.length > 0 &&
            Section.Parsed[0].Name && Section.Parsed[0].Question ? new CodeIdeationRenderer() : undefined;
    }
}

/** ParameterRenderer: A block that displays the a parameter. */
export class ParameterRenderer extends UIRendererOf<CodeParameter> {
    /** Question: The question mesage of the parameter. */
    public Question: JQuery<HTMLElement>;
    /** Input: The content of the input. */
    public Input: JQuery<HTMLElement>;
    /** Examples: The examples of the input. */
    public Examples: JQuery<HTMLElement>;
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("parameter");
        this.Question = $(`<div class="Question"></div>`).appendTo(this.Container);
        this.Input = $(`<input type="text" />`).appendTo(this.Container);
        this.Examples = $(`<div class="Examples"></div>`).appendTo(this.Container);
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Parameter = this.GetData();
        // Render the question
        this.Question.text(Parameter.Question);
        // Sync the input
        if (typeof Parameter.Known === "string" || Parameter.Known as any instanceof String) {
            this.Input.val(Parameter.Known as string);
        } else {
            this.Input.val("");
        }
        this.Input.attr("placeholder", Parameter.Options?.[0] ?? "");
        // Render the examples
        this.Examples.empty();
        if (!Parameter.Options) return;
        var Input = this.Input;
        $("<span></span>").appendTo(this.Examples).text(EditorLocalized.Get("e.g."));
        for (var Option of Parameter.Options) {
            $(`<a href="javascript:void(0)"></a>`).data("option", Option).appendTo(this.Examples).text(Option).on("click", function() {
                Input.val($(this).data("option"));
            });
        }
    }
}

/** CodeParameter: A parameter for code ideation. */
export interface CodeParameter {
    /** Name: The name of the parameter. */
    Name: string;
    /** Question: The question displayed for the user. */
    Question: string;
    /** Known: The known value of the parameter. */
    Known: string | boolean;
    /** Options: The options for the parameter. */
    Options?: string[];
}