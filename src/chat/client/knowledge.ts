/** Knowledge: A knowledge piece for the client. */
export interface Knowledge {
    /** ID: The ID of the knowledge. */
    ID: string;
    /** Title: The display title of the knowledge. */
    Title: string;
    /** Type: The type of the knowledge. */
    Type: string;
    /** Content: The markdown content of the knowledge. */
    Content: string;
    /** Translated: The translated content of the knowledge. */
    Translated?: string;
    /** SeeAlso: The see-also links. */
    SeeAlso: Record<string, string>;
    /** Acknowledgement: The acknowledgement or source of the knowledge. */
    Acknowledgement: string;
}