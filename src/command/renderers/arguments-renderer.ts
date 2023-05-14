import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { OutputDisplay } from "../displays/output";
import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "../sections/json-section-renderer";
import { CodeParameter, ParameterRenderer } from "./parameter-renderer";

/** ArgumentsRenderer: A dedicated block for displaying arguments. */
export class ArgumentsRenderer extends JSONSectionRenderer<CodeArguments> {
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
        var Package = this.GetParsed();
        if (this.Finalized) {
            this.ContentContainer = $(`<div class="parameters"></div>`).replaceAll(this.ContentContainer);
            // When finalized, render the entire HTML structure
            for (var Parameter of Package.Arguments) {
                var Renderer = new ParameterRenderer();
                this.AddChild(Renderer, false);
                Renderer.Container.appendTo(this.ContentContainer);
                Renderer.SetData(Parameter);
                Renderer.Render();
            }
            var Link = $(`<p><a href="javascript:void(0)">${Localized.Get("Execute the procedure")}</a></p>`)
                .appendTo(this.ContentContainer).on("click", () => {
                    this.SubmitArguments();
                    Link.addClass("chosen");
                });
        } else {
            this.ContentContainer.empty();
            // When not finalized, render the questions
            for (var Parameter of Package.Arguments) {
                $("<li></li>").appendTo(this.ContentContainer).text(Parameter.Question ?? Parameter.Name);
            }
        }
    }
    /** SubmitArguments: Submit the arguments to execute. */
    private SubmitArguments(): void {
        var Package = this.GetParsed();
        // Compose the input
        var Failed = false;
        var Composed: Record<string, string> = {};
        this.Children.forEach(Renderer => {
            var Current = Renderer as ParameterRenderer;
            var Result = Current.GetOutput(false);
            if (Result == null) Failed = true;
            else Composed[Result[0]] = Result[1];
        });
        // Send it back to execute
        if (Failed) return;
        OutputDisplay.Instance.Tab.ExecuteProcedureWithArguments(Package.Procedure, Package.IsTemporary ?? false, Composed);
    }
    /** GetChooser: Return the section chooser for this renderer. */
    public static GetChooser(): RendererChooser {
        return (Record, Section) => Section.Field == "Arguments" && Section.Parsed && Section.Parsed.Procedure ? new ArgumentsRenderer() : undefined;
    }
}

/** CodeArguments: A package for execution. */
export interface CodeArguments {
    /** Arguments: The arguments for the procedure. */
    Arguments: CodeParameter[];
    /** Procedure: The procedure to execute. */
    Procedure: string;
    /** Temporary: Whether the procedure is in the temporary context. */
    IsTemporary?: boolean;
}