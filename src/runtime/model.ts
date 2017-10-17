export interface RootElement extends HTMLElement {
    __content__?: Element
    __visited__?: boolean
}

export interface ParentElement extends HTMLElement {
    fcIndex?: number
}

export interface Context {
    root?: RootElement

    parent?: ParentElement

    document?: Document
}

export interface ElementOptions {
    content?: boolean

    key?: string

    skipChildren?: boolean

    found?: Node
}

export interface NodeFactory {
    (value: string): Node
}
