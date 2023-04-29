/** UIRenderer: Abstract class for rendering UI elements. */
export abstract class UIRenderer {
    /** Container: The container for the renderer. */
    public Container: JQuery<HTMLElement>;
    /** Children: The children UI renderers. */
    protected Children: UIRenderer[] = [];
    /** Parent: The parent UI renderer. */
    protected Parent?: UIRenderer;
    /** AddChild: Add a child renderer. */
    public AddChild(Renderer: UIRenderer): UIRenderer {
        this.Children.push(Renderer);
        this.Container.append(Renderer.Container);
        Renderer.Parent = this;
        return this;
    }
    /** Dirty: Whether the renderer is dirty and needs to be updated. */
    private Dirty: boolean;
    /** SetDirty: Set the dirty status of the renderer. */
    public SetDirty(Status: boolean): UIRenderer {
        this.Dirty = Status;
        if (Status) this.Parent?.SetDirty(Status);
        return this;
    }
    /** Render: Render the UI element if it is dirty. */
    public Render(): UIRenderer {
        if (this.Dirty) {
            for (var Child of this.Children)
                Child.Render();
            this.RenderInternal();
            this.Dirty = false;
        }
        return this;
    }
    /** RenderInternal: Render the UI element. */
    protected abstract RenderInternal(): void;
}