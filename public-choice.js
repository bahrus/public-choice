import { XtalElement } from 'xtal-element/xtal-element.js';
import { createTemplate, newRenderContext } from 'xtal-element/utils.js';
import 'xtal-material/xtal-radio-group-md.js';
import { define } from 'trans-render/define.js';
import { PurrSistMyJson } from 'purr-sist/purr-sist-myjson.js';
import { decorate } from 'trans-render/decorate.js';
import 'p-d.p-u/p-d.js';
import { XtalFrappeChart } from 'xtal-frappe-chart/xtal-frappe-chart.js';
import { appendTag } from 'trans-render/appendTag.js';
import { up } from 'trans-render/hydrate.js';
import { update } from 'trans-render/update.js';
const masterListId = 'yv8uy';
const mainTemplate = createTemplate(/* html */ `
<main>
    <section role="question">
        <slot name="question"></slot>
    </section>
    <xtal-radio-group-md name="pronoun">
        <slot name="options"></slot>
    </xtal-radio-group-md>
    <p-d on="value-changed" to="purr-sist-myjson[write]" prop="pc_vote" m="1"></p-d>
    <purr-sist-myjson read></purr-sist-myjson>
    <p-d on="value-changed" prop="value"></p-d>
    <purr-sist-myjson write></purr-sist-myjson>
    <p-d on="value-changed" prop="rawData"></p-d>
    <xtal-frappe-chart></xtal-frappe-chart>
</main>
`);
const already_voted = 'already-voted';
const guid = 'guid';
export class PublicChoice extends XtalElement {
    constructor() {
        super(...arguments);
        this._initContext = newRenderContext({
            main: {
                //section: 'What is your favorite pronoun?',
                [PurrSistMyJson.is]: ({ target }) => decorate(target, {
                    propVals: {
                        masterListId: '/' + masterListId,
                    },
                }),
                [PurrSistMyJson.is + '[write]']: ({ target }) => decorate(target, {
                    propDefs: {
                        pc_vote: null
                    },
                    methods: {
                        onPropsChange: function (propName, val) {
                            switch (propName) {
                                case 'pc_vote':
                                    const _this = this;
                                    const newVal = _this.newVal || _this.value;
                                    if (!newVal[val]) {
                                        newVal[val] = 0;
                                    }
                                    newVal[val]++;
                                    _this.newVal = { ...newVal };
                                    console.log(newVal);
                                    break;
                            }
                        }
                    }
                }),
                [XtalFrappeChart.is]: ({ target }) => decorate(target, {
                    propDefs: {
                        rawData: null,
                    },
                    methods: {
                        onPropsChange: function (propName, data) {
                            switch (propName) {
                                case 'rawData':
                                    const labels = [];
                                    for (const key in data) {
                                        if (key.startsWith('_'))
                                            continue;
                                        labels.push(key);
                                    }
                                    if (labels.length === 0)
                                        return;
                                    const fd = {
                                        title: 'Votes',
                                        data: {
                                            labels: labels,
                                            datasets: [
                                                {
                                                    name: "Votes",
                                                    color: "light-blue",
                                                    values: labels.map(key => isNaN(data[key]) ? 0 : data[key])
                                                }
                                            ]
                                        },
                                        "type": "bar",
                                        "height": 250,
                                        "isNavigable": true
                                    };
                                    //console.log(fd);
                                    this.data = fd;
                                    break;
                            }
                        }
                    }
                })
            }
        });
        this._updateContext = newRenderContext({
            main: {
                //section: 'What is your favorite pronoun?',
                [PurrSistMyJson.is]: ({ target }) => decorate(target, {
                    attribs: {
                        [guid]: this._guid,
                    },
                }),
            }
        });
    }
    static get is() { return 'public-choice'; }
    get mainTemplate() {
        return mainTemplate;
    }
    get initContext() { return this._initContext; }
    get updateContext() {
        this._updateContext.update = update;
        return this._updateContext;
    }
    get guid() {
        return this._guid;
    }
    set guid(nv) {
        this.attr(guid, nv);
    }
    attributeChangedCallback(n, ov, nv) {
        switch (n) {
            case guid:
                this._guid = nv;
                break;
        }
        super.attributeChangedCallback(n, ov, nv);
    }
    get ready() {
        return this._guid !== undefined;
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([guid]);
    }
    connectedCallback() {
        this[up]([guid]);
        if (!self[masterListId]) {
            appendTag(document.head, PurrSistMyJson.is, {
                attribs: {
                    id: masterListId,
                    read: true,
                    'store-id': 'yv8uy'
                }
            });
        }
        super.connectedCallback();
    }
}
define(PublicChoice);
