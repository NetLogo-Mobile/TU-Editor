import { Localized } from "../../../CodeMirror-NetLogo/src/editor";
import { TurtleEditor } from "../main";
declare const { showdown }: any;

/** MarkdownToHTML: Convert markdown to HTML. */
export function MarkdownToHTML(Source: string): string {
    return new showdown.Converter({
        underline: true,
        emoji: true
    }).makeHtml(Source);
}

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
            var Target = Fields[1];
            if (Target.startsWith("//")) Target = Target.slice(2);
            if (["observer", "turtles", "patches", "links", "help"].indexOf(Scheme) !== -1) {
                // Handle commands
                Current.on("click", () => Editor.CommandTab.ExecuteCommand(Scheme, Target));
            } else if (Current.hasClass("external")) {
                // Handle external links
                Current.on("click", () => Editor.Call({ Type: "Visit", Target: Href }));
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
