import { NetLogoContext } from "./chat/client/languages/netlogo-context";
import { CommandTab } from "./command/command-tab";
import { EditorTab } from "./editor/editor-tab";
import { Tab } from "./tab";
declare const Darkmode: any;
type Darkmode = any;
/** TurtleEditor: The multi-tab code editor for Turtle Universe. */
export declare class TurtleEditor {
    /** Container: The container HTMLElement. */
    readonly Container: HTMLElement;
    /** Darkmode: The darkmode support. */
    readonly Darkmode: Darkmode;
    /** PostMessage: The function to call to send messages to the facilitator. */
    static PostMessage: (Message: string) => void | null;
    /** Constructor: Constructor. */
    constructor(Container: HTMLElement, PostMessage: (Message: string) => void | null);
    /** Call: Call the facilitator (by default, the Unity Engine). */
    Call(Message: any): void;
    /** CommandTab: The command center tab. */
    readonly CommandTab: CommandTab;
    /** EditorTabs: The editor tabs. */
    readonly EditorTabs: EditorTab[];
    /** CurrentTab: The visible tab. */
    CurrentTab: Tab | null;
    /** GetAllTabs: Get all tabs. */
    GetAllTabs(): Tab[];
    /** HideAllTabs: Hide all tabs. */
    HideAllTabs(): void;
    /** BlurAll: Blur all tabs. */
    BlurAll(): void;
    /** ProjectName: The name of the project. */
    ProjectName?: string;
    /** GetContext: Get the NetLogo context. */
    GetContext(): NetLogoContext;
    /** Resize: Resize the viewport width (on mobile platforms) */
    Resize(Ratio: number): void;
    /** ToggleDark: Toggle the dark mode. */
    ToggleDark(Status: boolean): void;
    /** SetPlatform: Set the platform of the editor. */
    SetPlatform(Platform: string): void;
    /** Toast: Show a toast. */
    Toast(Type: string, Content: string, Subject?: string): void;
    /** Reset: Reset the editor. */
    Reset(): void;
}
export {};
