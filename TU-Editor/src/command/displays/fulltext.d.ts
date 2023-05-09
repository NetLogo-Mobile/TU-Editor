import { Display } from "./display";
import { CommandTab } from "../command-tab";
/** FullTextDisplay: Display the full-text help information. */
export declare class FullTextDisplay extends Display {
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab);
    /** RequestedTab: The tab that requested the full text. */
    private RequestedTab;
    /** ShowFullText: Show the full text of a command. */
    ShowFullText(Data: any): void;
    /** HideFullText: Hide the full text mode. */
    HideFullText(): void;
}
