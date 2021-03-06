import { NodeType } from './AbstractNode';
import { AbstractTextualNode } from './AbstractTextualNode';

export class TextNode extends AbstractTextualNode {
    constructor(text: string) {
        super(text);

        this.nodeName = '#text';
        this.nodeType = NodeType.Text;
    }
}
