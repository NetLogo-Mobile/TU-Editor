/// <reference types="jquery" />
/// <reference types="jquery" />
import { TurtleEditor } from "../main";
/** MarkdownToHTML: Convert markdown to HTML. */
export declare function MarkdownToHTML(Source: string): string;
/** XSSOptions: XSS filter options.*/
export declare const XSSOptions: {
    whiteList: {
        a: string[];
        abbr: string[];
        address: never[];
        area: string[];
        article: never[];
        aside: never[];
        b: never[];
        bdi: string[];
        bdo: string[];
        big: never[];
        blockquote: string[];
        br: never[];
        caption: never[];
        center: never[];
        cite: never[];
        code: never[];
        col: string[];
        colgroup: string[];
        dd: never[];
        del: string[];
        details: string[];
        div: never[];
        dl: never[];
        dt: never[];
        em: never[];
        figcaption: never[];
        figure: never[];
        font: string[];
        h1: never[];
        h2: never[];
        h3: never[];
        h4: never[];
        h5: never[];
        h6: never[];
        hr: never[];
        i: never[];
        ins: string[];
        li: never[];
        mark: never[];
        nav: never[];
        ol: never[];
        p: never[];
        pre: never[];
        s: never[];
        section: never[];
        small: never[];
        span: never[];
        sub: never[];
        summary: never[];
        sup: never[];
        strong: never[];
        strike: never[];
        table: string[];
        tbody: string[];
        td: string[];
        tfoot: string[];
        th: string[];
        thead: string[];
        tr: string[];
        tt: never[];
        u: never[];
        ul: never[];
    };
};
/** SafeguardHTML: Safeguard the HTML output. */
export declare function SafeguardHTML(Source: string): string;
/** PostprocessHTML: Postprocess the HTML, esp. links. */
export declare function PostprocessHTML(Editor: TurtleEditor, Source: JQuery<HTMLElement>): void;
/** RenderAgent: Render tips for an agent type. */
export declare function RenderAgent(Agent: string): string;
