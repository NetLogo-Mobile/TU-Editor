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