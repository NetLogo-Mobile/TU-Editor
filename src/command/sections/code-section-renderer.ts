import { NetLogoUtils } from "../../utils/netlogo";
import { CodeDisplay } from "../displays/code";
import { OutputDisplay } from "../displays/output";
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
            this.ContentContainer = $(`<code></code>`).replaceAll(this.ContentContainer)
                .on("click", () => this.EnterCode()).addClass("enterable");
            NetLogoUtils.AnnotateCode(this.ContentContainer, this.Code);
        } else {
            this.Code = Section.Content?.trim() ?? "";
            this.ContentContainer = $(`<pre></pre>`).replaceAll(this.ContentContainer).text(this.Code);
        }
    }
    /** EnterCode: Enter the code mode. */
    private EnterCode() {
        var Subthread = this.Parent!.Parent! as SubthreadRenderer;
        OutputDisplay.Instance.ActivateSubthread(Subthread);
        CodeDisplay.Instance.SetContext(this.GetRecord(), Subthread);
        CodeDisplay.Instance.Show();
    }
}