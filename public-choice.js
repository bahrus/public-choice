import { XtalElement } from 'xtal-element/xtal-element.js';
import { createTemplate, newRenderContext } from 'xtal-element/utils.js';
import 'xtal-material/xtal-radio-group-md.js';
import { define } from 'trans-render/define.js';
import { PurrSistMyJson } from 'purr-sist/purr-sist-myjson.js';
import 'purr-sist/purr-sist-idb.js';
import { decorate } from 'trans-render/decorate.js';
import 'p-d.p-u/p-d.js';
//import {refract} from 'xtal-element/refract.js';
import 'xtal-frappe-chart/xtal-frappe-chart.js';
import { appendTag } from 'trans-render/appendTag.js';
import { up } from 'trans-render/hydrate.js';
import { update } from 'trans-render/update.js';
import 'if-diff/if-diff.js';
export const masterListKey = Symbol('masterListKey');
const anySelf = self;
//const temp = [PurrSistIDB.is];
const mainTemplate = createTemplate(/* html */ `
<style>
    [data-allow-voting="-1"]{
        display:none;
    }
    xtal-frappe-chart[data-allow-view-results="-1"]{
        visibility: hidden;
        height:5px;
    }
    xtal-frappe-chart{
        pointer-events: none;
    }
</style>
<main>
    <section role="question">
        <slot name="question"></slot>
    </section>
    <!-- Read from local storage whether user has voted already. store-id set from guid property in update context.-->
    <purr-sist-idb data-role="getUserVoteStatus" db-name="pc_vote" store-name="user_status" read></purr-sist-idb>
    <!-- If already voted, hide options and display the results and vice versa -->
    <p-d on="value-changed" to="if-diff" prop="lhs"></p-d>
    <if-diff if lhs not_equals rhs="voted" tag="allowVoting" m="1"></if-diff>
    <if-diff if lhs equals rhs="voted" tag="allowViewResults" m="1"></if-diff>
    <!-- Options to vote on, passed in via light children.  -->
    <xtal-radio-group-md name="pronoun" data-flag="voted" data-allow-voting="-1">
        <slot name="options"></slot>
    </xtal-radio-group-md>
    <!-- Pass vote to purr-sist-*[write] elements for persisting.  -->
    <!-- pc_vote is a property slapped on to purr-sist-myjson via decorate inside init render context -->
    <p-d on="value-changed" to="[data-role='mergeVote']" prop="pc_vote" m="1"></p-d>
    <p-d on="value-changed" to="[data-role='saveIfUserVotedAlready']" prop="newVal" m="1" skip-init val="target.dataset.flag"></p-d>
    <!-- Store whether person already voted.  Put in local storage -->
    <purr-sist-idb data-role="saveIfUserVotedAlready" db-name="pc_vote" store-name="user_status" write></purr-sist-idb>
    <!-- Retrieve vote tally from MyJSON detail record linked (via updateContext) to master list created in connection callback -->
    <purr-sist-myjson data-role="getVote" read></purr-sist-myjson>
    <!-- Initialize writer to current value TODO: synchronize with other votes --> 
    <p-d on="value-changed" prop="value"></p-d>
    <!-- Persist vote to MyJSON detail record linked (via updateContext) to master list created in connection callback -->
    <purr-sist-myjson data-decorator="_mergeVoteDA" data-role="mergeVote" write></purr-sist-myjson>

    <!-- pass persisted votes to chart element -->
    <p-d on="value-changed" prop="rawData"></p-d>
    <xtal-frappe-chart data-decorator="_frappeDA"  data-allow-view-results="-1"></xtal-frappe-chart>
</main>
`);
const guid = 'guid';
function dynDecorator(target, host) {
    decorate(target, host[target.dataset.decorator]);
}
export class PublicChoice extends XtalElement {
    constructor() {
        super(...arguments);
        this._mergeVoteDA = {
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
                            break;
                    }
                }
            }
        };
        this._frappeDA = {
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
        };
        this._initContext = newRenderContext({
            main: {
                '[data-decorator]': ({ target }) => dynDecorator(target, this),
            }
        });
        this._updateContext = newRenderContext({
            main: {
                //section: 'What is your favorite pronoun?',
                '[data-role="mergeVote"], [data-role="getVote"]': ({ target }) => decorate(target, {
                    propVals: {
                        masterListId: '/' + this._masterListId,
                    },
                    attribs: {
                        guid: this._guid,
                    },
                }),
                '[data-role="saveIfUserVotedAlready"], [data-role="getUserVoteStatus"]': ({ target }) => decorate(target, {
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
            //Create Master List component in document.head
            appendTag(document.head, PurrSistMyJson.is, {
                attribs: {
                    id: this._masterListId,
                    read: true,
                    'store-id': this._masterListId
                },
            });
        }
        super.connectedCallback();
    }
}
define(PublicChoice);
