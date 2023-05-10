import { RendererChooser } from "../outputs/record-renderer";
import { JSONSectionRenderer } from "./json-section-renderer";
/** HelpSectionRenderer: A block that displays the a help response section. */
export declare class HelpSectionRenderer extends JSONSectionRenderer<HelpMetadata> {
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void;
    /** GetChooser: Return the section chooser for this renderer. */
    static GetChooser(): RendererChooser;
}
/** HelpMetadata: The metadata for the help section. */
export interface HelpMetadata {
    parameter: string;
    display_name: string;
    short_description: string;
    agents: string[];
    see_also: string[];
}
