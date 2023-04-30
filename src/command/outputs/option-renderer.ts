import { ChatResponseOption } from "../../chat/client/chat-option";
import { UIRendererOf } from "./ui-renderer";

/** OptionRenderer: A block that displays the a chat option. */
export class OptionRenderer extends UIRendererOf<ChatResponseOption> {
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement> {
        return $(`<li class="option"><a href="javascript:void(0)"></a></li>`);
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        this.Container.addClass(this.GetData().Style ?? "generated").text(this.GetData().LocalizedLabel ?? this.GetData().Label);
    }
}