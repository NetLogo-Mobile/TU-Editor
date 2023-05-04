/** UIRenderer: Abstract class for rendering UI elements. */
export abstract class UIRenderer {
    /** Container: The container for the renderer. */
    public Container: JQuery<HTMLElement>;
    /** Dirty: Whether the renderer is dirty and needs to be updated. */
    private Dirty: boolean = false;
    /** ContainerInitializer: The initializer for the container. */
    protected ContainerInitializer(): JQuery<HTMLElement> {
        return $("<div></div>");
    }
    /** Constructor: Create a new UI renderer. */
    public constructor() { 
        this.Container = this.ContainerInitializer();
    }
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
    /** Children: The children UI renderers. */
    public Children: UIRenderer[] = [];
    /** Parent: The parent UI renderer. */
    public Parent?: UIRenderer;
    /** AddChild: Add a child renderer. */
    public AddChild(Renderer: UIRenderer, Append: boolean = true): UIRenderer {
        this.Children.push(Renderer);
        if (Append) this.Container.append(Renderer.Container);
        Renderer.Parent = this;
        return this;
    }
    /** RemoveChildren: Remove all children that satisfy a condition. */
    public RemoveChildren(Condition: (Child: UIRenderer) => boolean): UIRenderer {
        var Removal = this.Children.filter(Condition);
        Removal.forEach(Child => Child.Container.remove());
        this.Children = this.Children.filter((Child) => !Condition(Child));
        return this;
    }
    /** DeactivateAll: Deactivate all renderers. */
    public DeactivateAll(Class: string): UIRenderer {
        this.Children.forEach((Child) => {
            Child.Container.removeClass(Class);
        });
        return this;
    }
    /** ActivateSelf: Activate the renderer with a class name and deactivate all other renderers. */
    public ActivateSelf(Class: string): UIRenderer {
        this.Parent?.Children.forEach((Child) => {
            if (Child == this) 
                Child.Container.addClass(Class);
            else Child.Container.removeClass(Class);
        });
        return this;
    }
    /** SetStatus: Set the status of the renderer. */
    public SetStatus(Status: string): UIRenderer {
        this.Parent?.SetStatus(Status);
        return this;
    }
}

/** UIRendererOf: Abstract class for rendering UI elements. */
export abstract class UIRendererOf<T> extends UIRenderer {
    /** Data: The data to render. */
    protected Data?: T;
    /** SetData: Set the data to render. */
    public SetData(Data: T): UIRendererOf<T> {
        this.Data = Data;
        this.SetDirty(true);
        return this;
    }
    /** GetData: Get the data for rendering. */
    public GetData(): T {
        return this.Data!;
    }
}