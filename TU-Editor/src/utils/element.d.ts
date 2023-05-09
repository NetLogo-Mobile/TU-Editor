/// <reference types="jquery" />
/// <reference types="jquery" />
import { TurtleEditor } from "../main";
/** TransformLinks: Transform the embedded links. */
export declare function TransformLinks(Editor: TurtleEditor, Element: JQuery<HTMLElement>): void;
/** MarkdownToHTML: Convert markdown to HTML. */
export declare function MarkdownToHTML(Source: string): string;
/** LinkCommand: Generate a link for another command. */
export declare function LinkCommand(Query: JQuery<HTMLElement>): JQuery<HTMLElement>;
/** RenderAgent: Render tips for an agent type. */
export declare function RenderAgent(Agent: string): string;
