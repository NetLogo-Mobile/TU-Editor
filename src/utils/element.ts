import { Localized } from "src/legacy";
import { TurtleEditor } from "../main";

  // TransformLinks: Transform the embedded links.
 export function TransformLinks(Element) {
    if (TurtleEditor.PostMessage != null) return;
    Element.find("a").each((Index, Link) => {
        Link = $(Link);
        var Href = Link.attr("href");
        Link.attr("href", "javascript:void(0);");
        Link.on("click", function () { this.Call({ Type: "Visit", Target: Href }) });
    });
}

// LinkCommand: Generate a link for another command.
export function LinkCommand(Query: JQuery<HTMLElement>) {
    Query.each((Index, Item) => {
        var Current = $(Item);
        var Target = Current.attr("target");
        if (Target == null) Target = Current.text();
        var Objective = Current.attr("objective");
        if (!Objective) Objective = "null";
        Current.attr("href", "javascript:void(0)");
        Current.attr("onclick", `this.Execute(${Objective}, '${Target}')`);
    })
    return Query;
}

// RenderAgent: Render tips for an agent type.
export function RenderAgent(Agent) {
    var Message = Agent;
    switch (Agent) {
        case "turtles":
            Message = `${Localized.Get("海龟")}🐢`;
            break;
        case "patches":
            Message = `${Localized.Get("格子")}🔲`;
            break;
        case "links":
            Message = `${Localized.Get("链接")}🔗`;
            break;
        case "observer":
            Message = `${Localized.Get("观察者")}🔎`;
            break;
        case "utilities":
            Message = `${Localized.Get("工具")}🔨`;
            break;
    }
    return Message;
}
