/* tslint:disable no-empty*/
import {Factory} from './Factory';
import {Map} from './model';

export abstract class FcTag {

    /**
     * Invoked when starting tag of the element is found.
     * @param factory the factory
     * @param name the name
     * @param attributes the attributes
     */
    public startTag(factory: Factory, name: string, attributes: Map<string>): void {
    }

    /**
     * Invoked when ending tag of the element is found.
     * @param {!Factory} factory the factory
     * @param {!string} name the name
     */
    public endTag(factory: Factory, name: string): void {
    }

}
