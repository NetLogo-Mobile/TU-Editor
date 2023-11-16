import { Localized } from "../../../CodeMirror-NetLogo/src/editor";
import { TurtleEditor } from "../main";
import * as xss from "xss";
declare const { showdown }: any;

/** MarkdownToHTML: Convert markdown to HTML. */
export function MarkdownToHTML(Source: string): string {
    return SafeguardHTML(new showdown.Converter({
        underline: true,
        emoji: true,
        disableForced4SpacesIndentedSublists: true
    }).makeHtml(Source));
}

/** XSSOptions: XSS filter options.*/
export const XSSOptions = { 
    whiteList: {
        a: ["href", "title", "class"],
        abbr: ["title"],
        address: [],
        area: ["shape", "coords", "href", "alt"],
        article: [],
        aside: [],
        b: [],
        bdi: ["dir"],
        bdo: ["dir"],
        big: [],
        blockquote: ["cite"],
        br: [],
        caption: [],
        center: [],
        cite: [],
        code: ["class"],
        col: ["align", "valign", "span", "width"],
        colgroup: ["align", "valign", "span", "width"],
        dd: [],
        del: ["datetime"],
        details: ["open"],
        div: [],
        dl: [],
        dt: [],
        em: [],
        figcaption: [],
        figure: [],
        font: ["color", "size", "face"],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
        hr: [],
        i: [],
        ins: ["datetime"],
        li: [],
        mark: [],
        nav: [],
        ol: [],
        p: [],
        pre: [],
        s: [],
        section: [],
        small: [],
        span: [],
        sub: [],
        summary: [],
        sup: [],
        strong: [],
        strike: [],
        table: ["width", "border", "align", "valign"],
        tbody: ["align", "valign"],
        td: ["width", "rowspan", "colspan", "align", "valign"],
        tfoot: ["align", "valign"],
        th: ["width", "rowspan", "colspan", "align", "valign"],
        thead: ["align", "valign"],
        tr: ["rowspan", "align", "valign"],
        tt: [],
        u: [],
        ul: []
    },
    safeAttrValue: (Tag: string, Attribute: string, Value: string, CSSFilter: XSS.ICSSFilter) => {
        if (Attribute === "href") return Value;
        return xss.safeAttrValue(Tag, Attribute, Value, CSSFilter);
    }
};

/** SafeguardHTML: Safeguard the HTML output. */
export function SafeguardHTML(Source: string): string {
    return xss.filterXSS(Source, XSSOptions);
}

(window as any).SafeguardHTML = SafeguardHTML;

/** PostprocessHTML: Postprocess the HTML, esp. links. */
export function PostprocessHTML(Editor: TurtleEditor, Source: JQuery<HTMLElement>) {
    Source.find("a").each((Index, Element) => {
        var Current = $(Element);
        var Href = Current.attr("href");
        // Special class: commands
        if (Current.hasClass("command")) Href = `observer:${Current.text()}`;
        // Force the link to be disabled
        Current.attr("href", "javascript:void(0)");
        if (!Href) return;
        // Parse the scheme
        var Delimiter = ":";
        if (Href.indexOf("=") !== -1 && Href.indexOf(":") === -1)
            Delimiter = "=";
        if (Href.indexOf(Delimiter) !== -1) {
            var Fields = Href.split(Delimiter);
            var Scheme = Fields[0];
            var Target = Fields.slice(1).join(Delimiter);
            if (Target.startsWith("//")) Target = Target.slice(2);
            if (["observer", "turtles", "patches", "links", "help"].indexOf(Scheme) !== -1) {
                // Handle commands
                Current.on("click", () => {
                    if (!Editor.CommandTab.Disabled) Editor.CommandTab.ExecuteCommand(Scheme, Target, false);
                });
            } else if (Scheme == "knowledge") {
                Current.on("click", () => Editor.CommandTab.FullText.ShowKnowledge(Target));
            } else if (Current.hasClass("external") || Href.match(/^(https?:)?\/\/([^.]*?\.|)(turtlesim.com|hicivitas.com|northwestern.edu|netlogoweb.org)\//)) {
                // Handle external links
                if (!TurtleEditor.PostMessage) {
                    Current.attr("href", Href);
                    Current.attr("target", "_blank");
                } else {
                    Current.on("click", () => TurtleEditor.Call({ Type: "Visit", Target: Href }));
                }
            }
        }
    });
}

/** RenderAgent: Render tips for an agent type. */
export function RenderAgent(Agent: string) {
    var Message = Agent;
    switch (Agent) {
        case "turtles":
            Message = `${Localized.Get("Turtle")}🐢`;
            break;
        case "patches":
            Message = `${Localized.Get("Patch")}🔲`;
            break;
        case "links":
            Message = `${Localized.Get("Link")}🔗`;
            break;
        case "observer":
            Message = `${Localized.Get("Observer")}🔎`;
            break;
        case "utilities":
            Message = `${Localized.Get("Utility")}🔨`;
            break;
    }
    return Message;
}
