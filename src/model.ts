export interface Map<V> {
    [type: string]: V
}

export interface RenderFunction {
    (el: HTMLElement, ctx: any): void
}

export interface RenderFactory {
    (funclate: Funclate): RenderFunction
}

export interface Funclate {

    openElement: (name: string, attrs?: any[], props?: any[], opts?: any[]) => HTMLElement;

    closeElement: () => void;

    voidElement: (name: string, attrs?: string[], props?: any[], opts?: any[]) => HTMLElement

    comment: (text?: string) => Comment;

    text: (text?: string) => Text;

    content: () => void;

    createThenUpdate: (factory: RenderFactory, root: HTMLElement, context?: Map<any>) => RenderFunction;

    updateElement: (render: RenderFunction, root: HTMLElement, context?: Map<any>) => void;

}
