import { ChatRequest } from "../../chat/client/chat-request";
import { UIRendererOf } from "./ui-renderer";

/** InputRenderer: A block that displays the an user input. */
export class InputRenderer extends UIRendererOf<ChatRequest> {
    /** Avatar: The avatar of the input. */
    private Avatar: JQuery<HTMLElement>;
    /** Content: The content of the input. */
    private Content: JQuery<HTMLElement>;
    /** Constructor: Create a new UI renderer. */
    public constructor() {
        super();
        this.Container.addClass("input");
        this.Container.html(`
<div class="avatar"><img src="images/user.png" /></div>
<div class="content"></div>`);
        this.Avatar = this.Container.find(".avatar");
        this.Content = this.Container.find(".content");
    }
    /** RenderInternal: Render the UI element. */
    protected RenderInternal(): void {
        this.Content.text(this.GetData().Input);
    }
}