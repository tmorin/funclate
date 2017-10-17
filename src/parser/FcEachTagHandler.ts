import {Map} from '../model';
import {Factory} from './Factory';
import {FcTagHandler} from './FcTagHandler';
import {ParserOptions} from './ParserOptions';

/**
 * A funclate's tag implementing a forEach loop.
 * @example
 * <fc-each items="el.items">
 *     <li>{{ index }}/{{ all.length }} - {{ item }}</li>
 * </fc-each>
 */
export class FcEachTagHandler extends FcTagHandler {

    public startTag(factory: Factory, name: string, attributes: Map<string>, options: ParserOptions): void {
        const itemsVar = attributes['fc-items'] ? attributes['fc-items'] : '[]';
        const itemVar = attributes['fc-item'] ? attributes['fc-item'] : 'item';
        const indexVar = attributes['fc-index'] ? attributes['fc-index'] : 'index';
        const allVar = attributes['fc-all'] ? attributes['fc-all'] : 'all';
        factory.append(`${itemsVar}.forEach(function (${itemVar}, ${indexVar}, ${allVar}) {`);
    }

    public endTag(factory: Factory, name: string, options: ParserOptions): void {
        factory.append('});');
    }

}
