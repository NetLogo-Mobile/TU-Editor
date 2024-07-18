/* LoadPolyfills: Load all necessary polyfills. */
export function LoadPolyfills() {
    // ReplaceChildren
    // From: https://github.com/zloirock/core-js/issues/940
    Document.prototype.replaceChildren ||= replaceChildren;
    DocumentFragment.prototype.replaceChildren ||= replaceChildren;
    Element.prototype.replaceChildren ||= replaceChildren;
    
    function replaceChildren(this: Element, ...new_children: Element[]) {
        const { childNodes } = this;
        while (childNodes.length) {
            childNodes[0].remove();
        }
        this.append(...new_children);
    }
}