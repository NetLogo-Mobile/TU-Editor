import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { EnterCode } from "../../chat/client/options/option-templates";
import { NetLogoUtils } from "../../utils/netlogo";
import { CodeDisplay } from "../displays/code";
import { OutputDisplay } from "../displays/output";
import { RecordRenderer } from "../outputs/record-renderer";
import { SubthreadRenderer } from "../outputs/subthread-renderer";
import { SectionRenderer } from "./section-renderer";

/** CodeSectionRenderer: A block that displays the a code response section. */
export class CodeSectionRenderer extends SectionRenderer {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("code");
    }
    /** Code: The code of the section. */
    private Code?: string;
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Section = this.GetData();
        if (this.Finalized && Section.Content) {
            // Fix the code
            var Parent = this.GetRecord().Context?.CodeSnippet;
            var ParentSnapshot = NetLogoUtils.BuildSnapshot(Parent);
            Section.Content = NetLogoUtils.FixGeneratedCode(Section.Content, ParentSnapshot);
            this.Code = Section.Content;
            // Render the code
            this.ContentContainer = $(`<code></code>`).replaceAll(this.ContentContainer).addClass("enterable");
            NetLogoUtils.AnnotateCode(this.ContentContainer, this.Code);
            BindCode.bind(this)(this.ContentContainer);
            $(`<span></span>`).addClass("placeholder").text(Localized.Get("Code placeholder _", this.Code.split("\n").length)).appendTo(this.ContentContainer);
        } else {
            this.Code = Section.Content?.trim() ?? "";
            this.ContentContainer = $(`<pre></pre>`).replaceAll(this.ContentContainer).text(this.Code);
        }
    }
}

/** BindCode: Allows a code snippet to go into the full window. */
export function BindCode(this: SectionRenderer, Container: JQuery<HTMLElement>): JQuery<HTMLElement> {
    var Section = this.GetData();
    var Parent = (this.Parent! as RecordRenderer);
    // Bind the code
    var Enter = () => {
        var Subthread = this.Parent!.Parent! as SubthreadRenderer;
        OutputDisplay.Instance.ActivateSubthread(Subthread);
        CodeDisplay.Instance.SetContext(this.GetRecord(), Subthread);
        CodeDisplay.Instance.Show();
        OutputDisplay.Instance.ScrollToElement(Parent.Container);
        Parent.Container.find("li.editor").addClass("chosen");
    };
    // Technically, there should be only 1 enterable per section at this time
    if (Container.filter(".enterable").each((I, Element) => {
        if (!Section.Edited) Section.Edited = $(Element).children("span:eq(0)").get(0)?.innerText?.trim();
    }).on("click", Enter).length == 0) return Container;
    // Pseudo option
    if (Parent.GetData().Response.Options.findIndex(Option => Option.Style == "editor") === -1)
        this.ShowPseudoOption(EnterCode(), (Option) => Enter());
    return Container;
}