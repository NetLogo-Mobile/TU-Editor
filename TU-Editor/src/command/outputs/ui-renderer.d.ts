/// <reference types="jquery" />
/// <reference types="jquery" />
/** UIRenderer: Abstract class for rendering UI elements. */
export declare abstract class UIRenderer {
    /** Container: The container for the renderer. */
    Container: JQuery<HTMLElement>;
    /** Dirty: Whether the renderer is dirty and needs to be updated. */
    private Dirty;
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement>;
    /** Constructor: Create a new UI renderer. */
    constructor();
    /** SetDirty: Set the dirty status of the renderer. */
    SetDirty(Status: boolean): UIRenderer;
    /** Render: Render the UI element if it is dirty. */
    Render(): UIRenderer;
    /** RenderInternal: Render the UI element. */
    protected abstract RenderInternal(): void;
    /** Children: The children UI renderers. */
    Children: UIRenderer[];
    /** Parent: The parent UI renderer. */
    Parent?: UIRenderer;
    /** AddChild: Add a child renderer. */
    AddChild(Renderer: UIRenderer, Append?: boolean): UIRenderer;
    /** RemoveChildren: Remove all children that satisfy a condition. */
    RemoveChildren(Condition: (Child: UIRenderer) => boolean): UIRenderer;
    /** DeactivateAll: Deactivate all renderers. */
    DeactivateAll(Class: string): UIRenderer;
    /** ActivateSelf: Activate the renderer with a class name and deactivate all other renderers. */
    ActivateSelf(Class: string): UIRenderer;
    /** SetStatus: Set the status of the renderer. */
    SetStatus(Status: string): UIRenderer;
}
/** UIRendererOf: Abstract class for rendering UI elements. */
export declare abstract class UIRendererOf<T> extends UIRenderer {
    /** Data: The data to render. */
    protected Data?: T;
    /** SetData: Set the data to render. */
    SetData(Data: T): UIRendererOf<T>;
    /** GetData: Get the data for rendering. */
    GetData(): T;
}
