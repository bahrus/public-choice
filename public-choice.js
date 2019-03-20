import { XtalElement } from 'xtal-element/xtal-element.js';
import { createTemplate, newRenderContext } from 'xtal-element/utils.js';
import 'xtal-material/xtal-radio-group-md.js';
import { define } from 'xtal-element/define.js';
import { PurrSistMyJson } from 'purr-sist/purr-sist-myjson.js';
import { decorate, attribs } from 'trans-render/decorate.js';
const masterListId = 'yv8uy';
const mainTemplate = createTemplate(/* html */ `
<!-- <purr-sist-myjson id="master" read store-id="yv8uy"></purr-sist-myjson> -->
<main>
    <section role="question">
    Who are you?
    </section>
    <xtal-radio-group-md name="pronoun">
        <slot></slot>
    </xtal-radio-group-md>
    <!-- <p-d on="value-changed"  -->
    <purr-sist-myjson read guid="951c3b69-3e16-4f62-915b-ba3ca33a8e77"></purr-sist-myjson>
    <purr-sist-myjson write guid="951c3b69-3e16-4f62-915b-ba3ca33a8e77"></purr-sist-myjson>
</main>
`);
const already_voted = 'already-voted';
export class PublicChoice extends XtalElement {
    constructor() {
        super(...arguments);
        this._initContext = newRenderContext({
            main: {
                section: 'hi',
                [PurrSistMyJson.is]: ({ target }) => decorate(target, {
                    masterListId: '/' + masterListId,
                })
            }
        });
    }
    static get is() { return 'public-choice'; }
    get mainTemplate() {
        return mainTemplate;
    }
    get initContext() { return this._initContext; }
    get ready() { return true; }
    connectedCallback() {
        if (!self[masterListId]) {
            const purrSistMaster = document.createElement(PurrSistMyJson.is);
            decorate(purrSistMaster, {
                [attribs]: {
                    id: masterListId,
                    read: true,
                    'store-id': 'yv8uy'
                }
            });
            document.head.appendChild(purrSistMaster);
        }
        super.connectedCallback();
    }
}
define(PublicChoice);
