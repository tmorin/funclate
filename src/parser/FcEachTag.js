import {FcTag} from './FcTag';

/**
 * A funclate's tag implementing a forEach loop.
 * @example
 * <fc-each items="el.items">
 *     <li>{{ index }}/{{ all.length }} - {{ item }}</li>
 * </fc-each>
 */
export class FcEachTag extends FcTag {
    startTag(factory, name, attributes, selfClosing) {
        const itemsVar = attributes['fc-items'] ? attributes['fc-items'].value : '[]';
        const itemVar = attributes['fc-item'] ? attributes['fc-item'].value : 'item';
        const indexVar = attributes['fc-index'] ? attributes['fc-index'].value : 'index';
        const allVar = attributes['fc-all'] ? attributes['fc-all'].value : 'all';
        factory.append(`${itemsVar}.forEach(function (${itemVar}, ${indexVar}, ${allVar}) {`);
    }

    endTag(factory, name) {
        factory.append('});');
    }
}
