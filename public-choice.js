import { XtalElement } from "xtal-element/xtal-element.js";
import { createTemplate, newRenderContext } from "xtal-element/utils.js";
import { define } from "trans-render/define.js";
import { decorate } from "trans-render/decorate.js";
import { appendTag } from "trans-render/appendTag.js";
import { chooser } from "trans-render/chooser.js";
import { update } from "trans-render/update.js";
import "xtal-frappe-chart/xtal-frappe-chart.js";
import "slot-bot/slot-bot.js";
import { initDecorators, updateDecorators } from "xtal-element/data-decorators.js";
export const masterListKey = Symbol("masterListKey");
const anySelf = self;
const mainTemplate = createTemplate(/* html */ `
<style>
    [data-allow-voting="-1"]{
        display:none;
    }
    [data-allow-view-results="-1"]{
        visibility: hidden;
        height:5px;
    }

</style>
<main>
    <xtal-sip><script nomodule>["purr-sist-idb", "p-d", "if-diff", "xtal-radio-group-md", "purr-sist-myjson"]</script></xtal-sip>
    <section role=question>
        <slot name=question></slot>
    </section>
    <!-- Read from local storage whether user has voted already. store-id set from guid property in _linkToGuid().-->
    <purr-sist-idb data-role=getUserVoteStatus db-name=pc_vote  data-update-decorators=_linkToGuid  store-name=user_status read></purr-sist-idb>
    <!-- If already voted, hide options and display the results and vice versa -->
    <p-d on=value-changed to=if-diff[-lhs] m=2></p-d>
    <if-diff if -lhs not_equals rhs=voted data-key-name=allowVoting m=1></if-diff>
    <if-diff if -lhs equals rhs=voted data-key-name=allowViewResults m=1></if-diff>
    <!-- Options to vote on, passed in via light children.  -->
    <slot name="options"></slot>
    <!-- <p-d-x-slot-bot on="slotchange" prop="innerHTML"></p-d-x-slot-bot> -->
    <slot-bot></slot-bot>
    <xtal-radio-group-md name="pronoun" data-flag="voted" data-allow-voting="-1"></xtal-radio-group-md>
    <!-- Pass vote to purr-sist-*[write] elements for persisting.  -->
    <!-- pc_vote is a property slapped on to purr-sist-myjson via _mergeVoteDA decorator -->
    <p-d on="value-changed" to="[data-role='mergeVote']" prop="pc_vote" m="1"></p-d>
    <p-d on="value-changed" to="[data-role='saveIfUserVotedAlready']" prop="newVal" m="1" skip-init val="target.dataset.flag"></p-d>
    <!-- Store whether person already voted.  Put in local storage -->
    <purr-sist-idb data-role="saveIfUserVotedAlready" data-update-decorators="_linkToGuid" db-name="pc_vote" store-name="user_status" write></purr-sist-idb>
    <div data-is="switch">
      <!-- Allow consumer to choose which remote persistence engine to use, based on some TBD config -->
      <template data-tag="myjson">
        <!-- Retrieve vote tally from MyJSON detail record linked (via updateContext) to master list created in connection callback -->
        <purr-sist-myjson data-role="getVote" read  data-update-decorators="_linkWithMaster"></purr-sist-myjson>
        <!-- Initialize writer to current value TODO: synchronize with other votes --> 
        <p-d on=value-changed prop=value></p-d>
        <!-- Persist vote to MyJSON detail record linked (via updateContext) to master list created in connection callback -->
        <purr-sist-myjson data-init-decorators=_mergeVoteDA data-update-decorators=_linkWithMaster data-role=mergeVote write></purr-sist-myjson>
      </template>
    </div>
    <!-- <div data-is="addToHead">
      <template data-tag="myjson">
        <script type="module">
          import "purr-sist/purr-sist-myjson.js";
        </script>
      </template>
    </div> -->

    <!-- pass persisted votes to chart element -->
    <p-d on="value-changed" prop="rawData"></p-d>
    <xtal-frappe-chart data-init-decorators="_frappeChartDataConverter"  data-allow-view-results="-1"></xtal-frappe-chart>
    <!-- <google-chart data-init-decorators="_frappeChartDataConverter"  data-allow-view-results="-1"></google-chart> -->
</main>
`);
const guid = "guid";
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
                        case "pc_vote":
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
        this._frappeChartDataConverter = {
            propDefs: {
                rawData: null
            },
            methods: {
                onPropsChange: function (propName, data) {
                    switch (propName) {
                        case "rawData":
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
        this._initRenderContext = newRenderContext({
            main: {
                '[data-init-decorators]': ({ target }) => this[initDecorators](target),
                'div[data-is="switch"]': ({ target }) => chooser(target, '[data-tag="myjson"]', 'afterend'),
            }
        });
        this._updateRenderContext = newRenderContext({
            main: {
                "[data-update-decorators]": ({ target }) => this[updateDecorators](target)
            }
        });
    }
    static get is() {
        return "public-choice";
    }
    get mainTemplate() {
        return mainTemplate;
    }
    _linkWithMaster(target) {
        decorate(target, {
            propVals: {
                masterListId: "/" + this._masterListId
            },
            attribs: {
                guid: this._guid
            }
        });
    }
    _linkToGuid(target) {
        decorate(target, {
            attribs: {
                "store-id": this._guid
            }
        });
    }
    get initRenderContext() {
        return this._initRenderContext;
    }
    get updateRenderContext() {
        this._updateRenderContext.update = update;
        return this._updateRenderContext;
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
    get readyToInit() {
        return this._guid !== undefined;
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([guid]);
    }
    connectedCallback() {
        this.propUp([guid]);
        this._masterListId = anySelf[masterListKey]
            ? anySelf[masterListKey]
            : "yv8uy";
        if (!self[this._masterListId]) {
            //Create Master List component in document.head
            appendTag(document.head, 'purr-sist-myjson', {
                attribs: {
                    id: this._masterListId,
                    read: true,
                    "store-id": this._masterListId
                }
            });
        }
        super.connectedCallback();
    }
}
define(PublicChoice);
