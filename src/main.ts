import { CommandTab } from "./command/command-tab";
import { EditorTab } from "./editor/editor-tab";
import { Localized, RotateScreen } from "./legacy";
import { Tab } from "./tab";

declare const { Darkmode, toastr }: any;
type Darkmode = any;

/** TurtleEditor: The multi-tab code editor for Turtle Universe. */
export class TurtleEditor {
  // #region "Foundational Interfaces"
  /** Container: The container HTMLElement. */
  public readonly Container: HTMLElement;
  /** Darkmode: The darkmode support. */
  public readonly Darkmode: Darkmode;
  /** PostMessage: The function to call to send messages to the facilitator. */
  public static PostMessage: (Message: string) => void | null;
  /** Constructor: Constructor. */
  public constructor(Container: HTMLElement, PostMessage: (Message: string) => void | null) {
    this.Container = Container;
    TurtleEditor.PostMessage = PostMessage;
    this.CommandTab = new CommandTab($(Container).children("div.command").get(0)!, this);
    this.EditorTabs = [new EditorTab($(Container).children("div.editor").get(0)!, this)];
    this.CommandTab.Show();
		this.Darkmode = new Darkmode();
  }
  /** Call: Call the facilitator (by default, the Unity Engine). */
  Call(Message) {
    if (TurtleEditor.PostMessage)
      TurtleEditor.PostMessage(JSON.stringify(Message));
    else console.log(Message);
  }
  // #endregion

  // #region "Tab Management"
  /** CommandTab: The command center tab. */
  public readonly CommandTab: CommandTab;
  /** EditorTabs: The editor tabs. */
  public readonly EditorTabs: EditorTab[] = [];
  /** CurrentTab: The visible tab. */
  public CurrentTab: Tab;
  /** GetAllTabs: Get all tabs. */
  public GetAllTabs(): Tab[] {
    return [this.CommandTab, ...this.EditorTabs];
  }
  /** HideAllTabs: Hide all tabs. */
  public HideAllTabs() {
    this.GetAllTabs().forEach(Tab => Tab.Hide());
  }
  /** BlurAll: Blur all tabs. */
  public BlurAll() {
    this.GetAllTabs().forEach(Tab => Tab.Blur());
  }
  // #endregion

  // #region "Editor Statuses"
  // Resize: Resize the viewport width (on mobile platforms)
  Resize(Ratio) {
    $("body").addClass("Mobile");
    $("#viewport").attr("content", `width=device-width,initial-scale=${Ratio},maximum-scale=${Ratio},minimum-scale=${Ratio},user-scalable=no,viewport-fit=cover`);
  }
  // SetDesktop: Set the desktop mode.
  SetFontsize(Status) {
    $("html").css("font-size", Status + "px");
  }
  // ToggleDark: Toggle the dark mode.
  ToggleDark(Status) {
    if (Status != this.Darkmode.isActivated()) this.Darkmode.toggle();
  }
  // SetPlatform: Set the platform of the editor.
  SetPlatform(Platform) {
    $("body").addClass(Platform);
  }
	// Toast: Show a toast.
	Toast = function(Type, Content, Subject) {
		toastr[Type](Content, Subject);
	}
  // #endregion
}

/** Export classes globally. */
try {
  (window as any).TurtleEditor = TurtleEditor;
  (window as any).TurtleLocalized = Localized;
  (window as any).RotateScreen = RotateScreen();
} catch (error) { }
