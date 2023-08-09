/// <reference types="jquery" />
/// <reference types="jquery" />
import { Display } from "./display";
import { CommandTab } from "../command-tab";
import { Knowledge } from "../../chat/client/knowledge";
/** FullTextDisplay: Display the full-text help information. */
export declare class FullTextDisplay extends Display {
    /** Header: The header of the full-text display. */
    Header: JQuery<HTMLElement>;
    /** HeaderLabel: The label of the header. */
    HeaderLabel: JQuery<HTMLElement>;
    /** Translator: The translator of the full-text display. */
    Translator: JQuery<HTMLElement>;
    /** OriginalButton: The button to show the original version. */
    OriginalButton: JQuery<HTMLElement>;
    /** TranslatedButton: The button to show the translated version. */
    TranslatedButton: JQuery<HTMLElement>;
    /** Content: The content of the full-text display. */
    Content: JQuery<HTMLElement>;
    /** SeeAlso: The see-also list. */
    SeeAlso: JQuery<HTMLElement>;
    /** Acknowledgement: The acknowledgement text. */
    Acknowledgement: JQuery<HTMLElement>;
    /** CurrentKnowledge: The current knowledge. */
    CurrentKnowledge: Knowledge | null;
    /** Constructor: Create a new output section. */
    constructor(Tab: CommandTab);
    /** RequestedTab: The tab that requested the full-screen help. */
    private RequestedTab;
    /** RequestedSection: The section that requested the full-screen help. */
    private RequestedSection;
    /** ShowKnowledge: Try to retrieve and show a knowledge. */
    ShowKnowledge(ID: string): void;
    /** ShowFullText: Show the full-screen help of a command. */
    ShowFullText(Knowledge: Knowledge): void;
    /** ShowOriginal: Show the original version of the full-text help. */
    ShowOriginal(): void;
    /** ShowTranslated: Show the translated version of the full-text help. */
    ShowTranslated(): void;
    /** SetContent: Set the content of the full-text help. */
    private SetContent;
    /** ShowPrimitive: Show the full-screen help of a primitive. */
    ShowPrimitive(Primitive: Record<string, any>): void;
    /** HideFullText: Hide the full text mode. */
    HideFullText(): void;
}
