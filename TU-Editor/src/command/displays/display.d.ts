/// <reference types="jquery" />
/// <reference types="jquery" />
import { CommandTab } from "../command-tab";
/** Display: A display section of Command Center. */
export declare abstract class Display {
    /** Tab: The related command tab. */
    readonly Tab: CommandTab;
    /** Container: The main container area.  */
    readonly Container: JQuery<HTMLElement>;
    /** ScrollContainer: The scrolling container of the section. */
    ScrollContainer: JQuery<HTMLElement>;
    Visible: boolean;
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab, Selector: string);
    /** Show: Show the section. */
    Show(): void;
    /** Hide: Hide the section. */
    Hide(): void;
    /** ScrollToBottom: After user entered input, screen view should scroll down to the bottom line. */
    ScrollToBottom(): void;
    /** IsAtBottom: Whether the container is scrolled to bottom. */
    IsAtBottom(): boolean;
}
