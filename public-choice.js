import { XtalElement } from 'xtal-element/xtal-element.js';
import { createTemplate, newRenderContext } from 'xtal-element/utils.js';
import 'xtal-material/xtal-radio-group-md.js';
import { define } from 'trans-render/define.js';
import { PurrSistMyJson } from 'purr-sist/purr-sist-myjson.js';
import { PurrSistIDB } from 'purr-sist/purr-sist-idb.js';
import { decorate } from 'trans-render/decorate.js';
import 'p-d.p-u/p-d.js';
import { XtalFrappeChart } from 'xtal-frappe-chart/xtal-frappe-chart.js';
import { appendTag } from 'trans-render/appendTag.js';
import { up } from 'trans-render/hydrate.js';
import { update } from 'trans-render/update.js';
import 'if-diff/if-diff.js';
export const masterListKey = Symbol('masterListKey');
const anySelf = self;
const mainTemplate = createTemplate(/* html */ `
<style>
    [data-show="-1"]{
        display:none;
    }
</style>
<main>
    <section role="question">
        <slot name="question"></slot>
    </section>
    <purr-sist-idb db-name="pc_vote" store-name="user_status" read></purr-sist-idb>
    <p-d on="value-changed" prop="lhs"></p-d>
    <if-diff if not_equals rhs="voted" tag="show"></if-diff>
    <xtal-radio-group-md name="pronoun" data-flag="voted" data-show="-1">
        <slot name="options"></slot>
    </xtal-radio-group-md>
    <p-d on="value-changed" to="purr-sist-myjson[write]" prop="pc_vote" m="1"></p-d>
    <p-d on="value-changed" to="purr-sist-idb[write]" prop="newVal" m="1" skip-init val="target.dataset.flag"></p-d>
    <purr-sist-idb db-name="pc_vote" store-name="user_status" write></purr-sist-idb>
    <purr-sist-myjson data-role="persist" read></purr-sist-myjson>
    <p-d on="value-changed" prop="value"></p-d>
    <purr-sist-myjson data-role="persist" write></purr-sist-myjson>
    <p-d on="value-changed" prop="rawData"></p-d>
    <xtal-frappe-chart></xtal-frappe-chart>
</main>
`);
const already_voted = 'already-voted';
const guid = 'guid';
//const tbd = `${PurrSistIDB.is}, ${PurrSistMyJson.is}`;
export class PublicChoice extends XtalElement {
    constructor() {
        super(...arguments);
        this._initContext = newRenderContext({
            main: {
                //section: 'What is your favorite pronoun?',
                [PurrSistMyJson.is]: ({ target }) => decorate(target, {
                    propVals: {
                        masterListId: '/' + this._masterListId,
                    },
                }),
                ['[data-role="persist"][write]']: ({ target }) => decorate(target, {
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
                                    //console.log(newVal);
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
                        guid: this._guid,
                    },
                }),
                [PurrSistIDB.is]: ({ target }) => decorate(target, {
                    attribs: {
                        "store-id": this._guid
                    }
                })
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
        this._masterListId = anySelf[masterListKey] ? anySelf[masterListKey] : 'yv8uy';
        if (!self[this._masterListId]) {
            appendTag(document.head, PurrSistMyJson.is, {
                attribs: {
                    id: this._masterListId,
                    read: true,
                    'store-id': this._masterListId
                }
            });
        }
        super.connectedCallback();
    }
}
define(PublicChoice);
