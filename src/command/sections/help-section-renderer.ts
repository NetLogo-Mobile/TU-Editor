import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { PostprocessHTML, RenderAgent } from "../../utils/element";
import { NetLogoUtils } from "../../utils/netlogo";
import { OutputDisplay } from "../displays/outputs";
import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "./json-section-renderer";

/** HelpSectionRenderer: A block that displays the a help response section. */
export class HelpSectionRenderer extends JSONSectionRenderer<HelpMetadata> {
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("help");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Metadata = this.GetData().Parsed! as HelpMetadata;
        this.ContentContainer.html(`
            <p><code>${Metadata.display_name}</code> - ${Metadata.agents.map((Agent: any) => `${RenderAgent(Agent)}`).join(", ")}</p>
            <p>${Metadata.short_description} (<a href="observer:help ${Metadata.display_name} -full">${Localized.Get("FullText")}</a>)</p>
            <p>${Localized.Get("SeeAlso")}: ${Metadata.see_also.map((Name) => `<a href="observer:help ${Name}">${Name}</a>`).join(", ")}</p>`)
        PostprocessHTML(OutputDisplay.Instance.Tab.Editor, this.ContentContainer);
        NetLogoUtils.AnnotateCodes(this.ContentContainer.find("code"));
    }
    /** GetChooser: Return the section chooser for this renderer. */
    public static GetChooser(): RendererChooser {
        return (Record, Section) => Section.Field == "Help" && Section.Parsed && Section.Parsed.display_name
            ? new HelpSectionRenderer() : undefined;
    }
}

/** HelpMetadata: The metadata for the help section. */
export interface HelpMetadata {
    parameter: string,
    display_name: string,
    short_description: string,
    agents: string[],
    see_also: string[]
}