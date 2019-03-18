import { XtalElement } from 'xtal-element/xtal-element.js';
import { createTemplate, newRenderContext } from 'xtal-element/utils.js';
import 'xtal-material/xtal-radio-group-md.js';
import { define } from 'xtal-element/define.js';
const mainTemplate = createTemplate(/* html */ `
<main>
<section role="question">
Who are you?
</section>
<xtal-radio-group-md name="pronoun">
    <slot></slot>
</xtal-radio-group-md>
</main>
`);
export class PublicChoice extends XtalElement {
    constructor() {
        super(...arguments);
        this._initContext = newRenderContext({
            section: 'hi'
        });
    }
    static get is() { return 'public-choice'; }
    get mainTemplate() {
        return mainTemplate;
    }
    get initContext() { return this._initContext; }
    get ready() { return true; }
}
define(PublicChoice);
