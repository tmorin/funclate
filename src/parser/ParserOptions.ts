import {Map} from '../model';
import {FcAttHandler} from './FcAttributeHandler';
import {FcTagHandler} from './FcTagHandler';

export interface TagHandlers extends Map<FcTagHandler> {
}

export interface AttHandlers extends Map<FcAttHandler> {
}

export interface ParserOptions {
    output?: string;

    pretty?: boolean;

    interpolation?: RegExp;

    propNamePrefix?: string;

    elVarName?: string;

    ctxVarName?: string;

    selfClosingElements?: string[];

    tagHandlers?: TagHandlers;

    attHandlers?: AttHandlers;
}
