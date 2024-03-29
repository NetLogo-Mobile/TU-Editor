import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { ChatManager } from "../../chat/chat-manager";
import { ChatResponseOption } from "../../chat/client/chat-option";
import { ChatResponseType } from "../../chat/client/chat-response";
import { MarkdownToHTML } from "../../utils/element";
import { RecordRenderer } from "./record-renderer";
import { UIRendererOf } from "./ui-renderer";

/** OptionRenderer: A block that displays the a chat option. */
export class OptionRenderer extends UIRendererOf<ChatResponseOption> {
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement> {
        var Container = $(`<li class="option"><a href="javascript:void(0)"></a></li>`);
        Container.on("click", () => this.ClickHandler());
        return Container;
    }
    /** SetData: Set the data of the renderer. */
    public SetData(Data: ChatResponseOption): UIRendererOf<ChatResponseOption> {
        if (!Data.LocalizedLabel) {
            var NewLocalized = Localized.Get(Data.Label);
            if (NewLocalized != Data.Label) Data.LocalizedLabel = NewLocalized;
        }
        return super.SetData(Data);
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        var Option = this.GetData();
        var Record = this.Parent! as RecordRenderer;
        // Get the class
        var Class = this.GetData().Style?.toLowerCase() ?? "generated";
        var Classes = Class.split(" ");
        if (!Classes.includes("leave") && !Classes.includes("editor") && 
            Record.GetData().Response.Sections.findIndex(Section => Section.Type == ChatResponseType.Code) !== -1)
            Classes.push("editor-only");
        // Render the label
        this.Container.removeClass().addClass(Classes).children("a")
            .html(MarkdownToHTML(Option.LocalizedLabel ?? Option.Label).replace("<p>", "").replace("</p>", ""));
    }
    /** ClickHandler: The handler for the click event. */
    protected ClickHandler(): void {
        var Record = this.Parent! as RecordRenderer;
        var Option = this.GetData();
        if (Option.Callback) {
            Option.Callback();
        } else {
            if (!ChatManager.Instance.RequestOption(Option, Record.GetData())) return;
        }
        this.ActivateSelf("chosen");
    }
}