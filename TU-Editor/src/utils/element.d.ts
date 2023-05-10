/// <reference types="jquery" />
/// <reference types="jquery" />
import { TurtleEditor } from "../main";
/** MarkdownToHTML: Convert markdown to HTML. */
export declare function MarkdownToHTML(Source: string): string;
/** PostprocessHTML: Postprocess the HTML, esp. links. */
export declare function PostprocessHTML(Editor: TurtleEditor, Source: JQuery<HTMLElement>): void;
/** RenderAgent: Render tips for an agent type. */
export declare function RenderAgent(Agent: string): string;
