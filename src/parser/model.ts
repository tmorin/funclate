import {FcTag} from './FcTag';

export interface Map<V> {
    [type: string]: V
}

export interface Tags extends Map<FcTag> {
}

export interface ParserOptions {
    output?: string;

    pretty?: boolean;

    interpolation?: RegExp;

    propNamePrefix?: string;

    elVarName?: string;

    ctxVarName?: string;

    selfClosingElements?: string[];

    tags?: Tags;
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

export interface RenderFunction {
    (el: HTMLElement, ctx: Map<any>): void
}

export interface RenderFactory {
    (funclate: any): RenderFunction
}
