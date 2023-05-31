import { Localized } from "../../../CodeMirror-NetLogo/src/editor";
import { OutputDisplay } from "../command/displays/output";
import { Toast } from "./dialog";

/** GenerateObjectID: Generate a random object ID. */
export function GenerateObjectID() {
    return NumberToHex(Date.now() / 1000) + ' '.repeat(16).replace(/./g, () => NumberToHex(Math.random() * 16));
}
  
/** NumberToHex: Convert a number to hex. */
export function NumberToHex(Value: number) {
    return Math.floor(Value).toString(16);
}

/** CopyCode: Copy a code snippet to the clipboard. */
export function CopyCode(Code: string) {
    Code = Code.trim();
    navigator.clipboard.writeText(Code);
    if (Code.indexOf("\n") === -1) {
        OutputDisplay.Instance.Tab.SetCode("observer", Code);
        OutputDisplay.Instance.Tab.Galapagos.Focus();
        Toast("success", Localized.Get("Press enter to execute again"));
    } else Toast("success", Localized.Get("Copied to clipboard"));
}