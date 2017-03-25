import {parse} from '../parser';

/**
 * @ignore
 */
export default function ({types: t}) {
    return {
        visitor: {
            TaggedTemplateExpression(path, state) {
                if (path.node.tag.name === 'funclate' && path.node.quasi.quasis.length === 1) {
                    state.opts.output = 'string';
                    parse(path.node.quasi.quasis[0].value.cooked, state.opts, (err, factory) => {
                        path.replaceWithSourceString(factory);
                    });
                }
            }
        }
    };
}
