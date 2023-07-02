import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { UIRendererOf } from "../outputs/ui-renderer";

/** ParameterRenderer: A block that displays a parameter. */
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
        this.Question.text(Parameter.Question ?? `${Localized.Get("Argument")} ${Parameter.Name}`);
        // Sync the input
        if (Parameter.Known == "true") {
            this.Input.val(Parameter.Examples?.[0] as string ?? "");
        } else {
            this.Input.val("");
        }
        this.Input.attr("placeholder", Parameter.Examples?.[0] ?? "");
        // Render the examples
        this.Examples.empty();
        if (!Parameter.Examples || Parameter.Examples.length == 0) return;
        var Input = this.Input;
        $("<span></span>").appendTo(this.Examples).text(Localized.Get("e.g."));
        for (var Option of Parameter.Examples) {
            $(`<a href="javascript:void(0)"></a>`).data("option", Option).appendTo(this.Examples).text(Option).on("click", function() {
                Input.val($(this).data("option"));
            });
        }
    }
    /** GetOutput: Return the output of the parameter. */
    public GetOutput(AllowEmpty: boolean = true): [string, string] | null {
        var Parameter = this.GetData();
        // Get the value
        var Value = this.Input.val();
        if (!Value || Value === "") Value = this.Input.attr("placeholder");
        // Check emptiness
        if (!Value || Value === "") {
            if (AllowEmpty) {
                Value = "";
            } else {
                this.Container.addClass("error");
                return null;
            }
        }
        this.Container.removeClass("error");
        // Return the output
        return [Parameter.Question, Value.toString()];
    }
}

/** CodeParameter: A parameter for code ideation. */
export interface CodeParameter {
    /** Name: The name of the parameter. */
    Name: string;
    /** Question: The question displayed for the user. */
    Question: string;
    /** Known: Is the value known for the parameter. */
    Known?: "true" | "false";
    /** Examples: The examples for the parameter. */
    Examples?: string[];
}