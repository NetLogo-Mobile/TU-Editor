import { ClientChatRequest } from "../../chat/client/chat-request";
import { MarkdownToHTML, PostprocessHTML } from "../../utils/element";
import { NetLogoUtils } from "../../utils/netlogo";
import { OutputDisplay } from "../displays/output";
import { UIRendererOf } from "./ui-renderer";

/** InputRenderer: A block that displays the an user input. */
export class InputRenderer extends UIRendererOf<ClientChatRequest> {
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
        var Input = this.GetData().FriendlyInput ?? this.GetData().Input;
        this.Container.toggle(!!Input && Input !== "");
        this.Content.html(MarkdownToHTML(Input));
        PostprocessHTML(OutputDisplay.Instance.Tab.Editor, this.Content);
        NetLogoUtils.AnnotateCodes(this.Content.find("code"));
    }
}