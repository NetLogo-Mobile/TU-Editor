import { Tab } from "../../tab";
import { RenderAgent, MarkdownToHTML, PostprocessHTML } from "../../utils/element";
import { Display } from "./display";
import { CommandTab } from "../command-tab";
import { NetLogoUtils } from "../../utils/netlogo";
import { Knowledge } from "../../chat/client/knowledge";
import { Localized } from "../../../../CodeMirror-NetLogo/src/editor";
import { ChatNetwork } from "../../chat/chat-network";
import { Toast } from "../../utils/dialog";

/** FullTextDisplay: Display the full-text help information. */
export class FullTextDisplay extends Display {
	/** Header: The header of the full-text display. */
	public Header: JQuery<HTMLElement>;
	/** HeaderLabel: The label of the header. */
	public HeaderLabel: JQuery<HTMLElement>;
	/** Translator: The translator of the full-text display. */
	public Translator: JQuery<HTMLElement>;
	/** OriginalButton: The button to show the original version. */
	public OriginalButton: JQuery<HTMLElement>;
	/** TranslatedButton: The button to show the translated version. */
	public TranslatedButton: JQuery<HTMLElement>;
	/** Content: The content of the full-text display. */
	public Content: JQuery<HTMLElement>;
	/** SeeAlso: The see-also list. */
	public SeeAlso: JQuery<HTMLElement>;
	/** Acknowledgement: The acknowledgement text. */
	public Acknowledgement: JQuery<HTMLElement>;
	/** CurrentKnowledge: The current knowledge. */
	public CurrentKnowledge: Knowledge | null = null;
	/** Constructor: Create a new output section. */
	public constructor(Tab: CommandTab) {
		super(Tab, ".command-fulltext");
		// Create the header
		var Header = $("<h2></h2>").appendTo(this.Container);
		this.Header = $("<strong></strong>").appendTo(Header);
		this.HeaderLabel = $("<span></span>").appendTo(Header);
		// Return to the last page
		var Previous = $(`<p>&lt; <a href="javascript:void(0)"></a></p>`).appendTo(this.Container);
		Previous.find("a").text(Localized.Get("PreviousPage")).on("click", () => this.HideFullText());
		// Machine translation
		this.Translator = $(`
		<div class="translator">
			<p>${Localized.Get("Translated version")}<a href="javascript:void(0)">${Localized.Get("ClickHere")}</a> ${Localized.Get("Switch to original")}</p>
			<p>${Localized.Get("Original version")}<a href="javascript:void(0)">${Localized.Get("ClickHere")}</a> ${Localized.Get("Switch to translated")}</p>
		</div>`).appendTo(this.Container);
		this.OriginalButton = $(this.Translator.find("a")[0]).on("click", () => this.ShowOriginal()).parent();
		this.TranslatedButton = $(this.Translator.find("a")[1]).on("click", () => this.ShowTranslated()).parent();
		// Create the full text
		this.Content = $("<div class='fulltext'></div>").appendTo(this.Container);
		// Create the see-also list
		$("<h4></h4>").text(Localized.Get("SeeAlso")).appendTo(this.Container);
		this.SeeAlso = $("<ul class='SeeAlso'></ul>").appendTo(this.Container);
		// Create the acknowledgement
		$("<h4></h4>").text(Localized.Get("Acknowledgement")).appendTo(this.Container);
		this.Acknowledgement = $("<p class='Acknowledge'></p>").appendTo(this.Container);
		// Return to the last page
		Previous = $(`<p>&lt; <a href="javascript:void(0)"></a></p>`).appendTo(this.Container);
		Previous.find("a").text(Localized.Get("PreviousPage")).on("click", () => this.HideFullText());
	}
    /** RequestedTab: The tab that requested the full-screen help. */
	private RequestedTab: Tab | null = null;
	/** ShowKnowledge: Try to retrieve and show a knowledge. */
	public ShowKnowledge(ID: string) {
		ChatNetwork.GetKnowledge(ID).then((Knowledge) => {
			this.ShowFullText(Knowledge);
		}).catch((Error) => {
			console.error(Error);
			Toast("error", Localized.Get("Failed to retrieve knowledge"));
		});
	}
	/** ShowFullText: Show the full-screen help of a command. */
	public ShowFullText(Knowledge: Knowledge) {
		// Show the current tab
		this.RequestedTab = this.Tab.Editor.CurrentTab;
		this.CurrentKnowledge = Knowledge;
		this.Show();
		// Render the subject
		this.Header.text(Knowledge.Title);
		this.HeaderLabel.text(`(${Knowledge.Type})`);
		// Render the full text
		if (Knowledge.Translated) {
			this.ShowTranslated();
			this.Translator.show();
		} else {
			this.ShowOriginal();
			this.Translator.hide();
		}
		// Render the acknowledgement
		this.Acknowledgement.html(MarkdownToHTML(Knowledge.Acknowledgement));
		// Render the see-also list
		var SeeAlso = Knowledge.SeeAlso && Object.keys(Knowledge.SeeAlso).length > 0
		if (SeeAlso) {
			this.SeeAlso.show();
			this.SeeAlso.prev().show();
			this.SeeAlso.empty();
			for (var Primitive in Knowledge.SeeAlso) {
				var Link = Knowledge.SeeAlso[Primitive];
				$(`<li><a href="${Link}">${Primitive}</a></li>`).appendTo(this.SeeAlso)
			}
			PostprocessHTML(this.Tab.Editor, this.SeeAlso);
		} else {
			this.SeeAlso.hide();
			this.SeeAlso.prev().hide();
		}
	}
	/** ShowOriginal: Show the original version of the full-text help. */
	public ShowOriginal() {
		if (!this.CurrentKnowledge) return;
		this.SetContent(this.CurrentKnowledge.Content);
		this.OriginalButton.hide();
		this.TranslatedButton.show();
	}
	/** ShowTranslated: Show the translated version of the full-text help. */
	public ShowTranslated() {
		if (!this.CurrentKnowledge?.Translated) return;
		this.SetContent(this.CurrentKnowledge.Translated);
		this.OriginalButton.show();
		this.TranslatedButton.hide();
	}
	/** SetContent: Set the content of the full-text help. */
	private SetContent(Content: string) {
		this.Content.html(MarkdownToHTML(Content));
		NetLogoUtils.AnnotateCodes(this.Content.find("code"));
		PostprocessHTML(this.Tab.Editor, this.Content);
		this.Container.scrollTop(0);
	}
	/** ShowPrimitive: Show the full-screen help of a primitive. */
	public ShowPrimitive(Primitive: Record<string, any>) {
		var SeeAlso: Record<string, string> = {};
		for (var Key in Primitive["see_also"])
			SeeAlso[Key] = `help:${Key} -full`;
		var Knowledge: Knowledge = {
			ID: Primitive["display_name"],
			Title: Primitive["display_name"],
			Type: Primitive["agents"].map((Agent: any) => `${RenderAgent(Agent)}`).join(", "),
			Content: Primitive["content"],
			Translated: Primitive["translation"],
			Acknowledgement: Primitive["acknowledge"],
			SeeAlso: SeeAlso
		}
		this.ShowFullText(Knowledge);
	}
	/** HideFullText: Hide the full text mode. */
	public HideFullText() {
		if (!this.Container.is(":visible")) return;
		this.Container.hide();
        this.RequestedTab?.Show();
	}
}