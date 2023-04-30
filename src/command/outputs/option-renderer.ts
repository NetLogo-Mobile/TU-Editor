import { ChatManager } from "../../chat/chat-manager";
import { ChatResponseOption } from "../../chat/client/chat-option";
import { SectionRenderer } from "../sections/section-renderer";
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
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        this.Container.addClass(this.GetData().Style ?? "generated").children("a")
            .text(this.GetData().LocalizedLabel ?? this.GetData().Label);
    }
    /** ClickHandler: The handler for the click event. */
    protected ClickHandler(): void {
        var Section = this.Parent! as SectionRenderer;
        var Record = Section.Parent! as RecordRenderer;
        ChatManager.Instance.RequestOption(this.GetData(), Section.GetData(), Record.GetData());
    }
}