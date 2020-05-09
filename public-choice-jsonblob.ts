import { XtalElement, SelectiveUpdate } from "xtal-element/XtalElement.js";
import { createTemplate } from "trans-render/createTemplate.js";
import { define } from "trans-render/define.js";
import { PurrSistAttribs } from "purr-sist/purr-sist.js";
import { decorate } from "trans-render/decorate.js";
import { appendTag } from "trans-render/appendTag.js";
import { DecorateArgs, TransformRules, PEASettings  } from "trans-render/types.d.js";
//import('p-et-alia/p-d.js');
import {extend} from 'p-et-alia/p-d-x.js';
import('if-diff/if-diff.js');
import('purr-sist/purr-sist-idb.js');
import('purr-sist/purr-sist-jsonblob.js')
import('xtal-radio-group-md/xtal-radio-group-md.js');
//import { update } from "trans-render/update.js";
//import "slot-bot/slot-bot.js";
import {
  initDecorators,
  updateDecorators
} from "xtal-element/data-decorators.js";
export const masterListKey = Symbol("masterListKey");
const anySelf = <any>self;
const mainTemplate = createTemplate(/* html */ `
<main>
    <section role=question>
        <slot name=question></slot>
    </section>
    <!-- Read from local storage whether user has voted already. store-id set from guid property in _linkToGuid().-->
    <purr-sist-idb data-role=getUserVoteStatus db-name=pc_vote store-name=user_status read -store-id></purr-sist-idb>
    <!-- If already voted, hide options and display the results and vice versa -->
    <p-d on=value-changed to=if-diff[-lhs] m=2></p-d>
    <if-diff if -lhs not_equals rhs=voted data-key-name=allowVoting m=1></if-diff>
    <if-diff if -lhs equals rhs=voted data-key-name=allowViewResults m=2></if-diff>

    <xtal-radio-group-md name="pronoun" data-flag="voted" data-allow-voting="-1">
      <!-- Options to vote on, passed in via light children.  -->
      <slot name="options"></slot>
    </xtal-radio-group-md>
    <!-- Pass vote to purr-sist-*[write] elements for persisting.  -->
    <!-- pc_vote is a property slapped on to purr-sist-jsonblob via _mergeVoteDA decorator -->
    <p-d on="value-changed" to="[data-role='mergeVote']" prop="pc_vote" m="1"></p-d>
    <p-d on="value-changed" to="[data-role='saveIfUserVotedAlready']" prop="newVal" m="1" skip-init val="target.dataset.flag"></p-d>
    <!-- Store whether person already voted.  Put in local storage -->
    <purr-sist-idb data-role=saveIfUserVotedAlready db-name="pc_vote" store-name="user_status" write -store-id></purr-sist-idb>
    
    
    <!-- Retrieve vote tally from jsonblob detail record linked (via updateContext) to master list created in connection callback -->
    <purr-sist-jsonblob data-role="getVote" read  data-update-decorators="_linkWithMaster"></purr-sist-jsonblob>
    <!-- Initialize writer to current value TODO: synchronize with other votes --> 
    <p-d on=value-changed prop=value></p-d>
    <!-- Persist vote to jsonblob detail record linked (via updateContext) to master list created in connection callback -->
    <purr-sist-jsonblob data-init-decorators=_mergeVoteDA data-update-decorators=_linkWithMaster data-role=mergeVote write></purr-sist-jsonblob>



    <!-- pass persisted votes to chart element -->
    <p-d-x-to-frappe-chart-data on=value-changed to=[-data]></p-d-x-to-frappe-chart-data>
    <template data-allow-view-results="-1">
      <xtal-frappe-chart -data></xtal-frappe-chart>
    </template>
    
</main>
`);

const guid = "guid";

export class PublicChoiceJsonBlob extends XtalElement {
  static get is() {
    return 'public-choice-jsonblob';
  }
  
  get readyToInit() {
    return this._guid !== undefined;
  }
  readyToRender = true;

  mainTemplate = mainTemplate;

  initTransform = {} as TransformRules;

  updateTransforms = [
    ({guid} : PublicChoiceJsonBlob) => ({
      main:{
        '[-store-id]': ({target}) =>{
          target.storeId = guid;
        }
      }
    }) as TransformRules
  ] as SelectiveUpdate[];

  // selectiveUpdateTransforms = [

  // ];

  // _updateRenderContext = newRenderContext({
  //   main: {
  //     "[data-update-decorators]": ({ target }) => this[updateDecorators](target)
  //   }
  // });
  // get updateRenderContext() {
  //   this._updateRenderContext.update = update;
  //   return this._updateRenderContext;
  // }

  _masterListId!: string;

  _mergeVoteDA: DecorateArgs = {
    propDefs: {
      pc_vote: null
    },
    methods: {
      onPropsChange: function(propName: string, val: string) {
        switch (propName) {
          case "pc_vote":
            const _this = (<any>this);
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



  _linkWithMaster(target: Element) {
    decorate(target as HTMLElement, {
      propVals: {
        masterListId: "/" + this._masterListId
      } as any,
      attribs: {
        guid: this._guid
      } as any
    });
  }

  _linkToGuid(target: Element) {
    decorate(target as HTMLElement, {
      attribs: {
        "store-id": this._guid
      } as any
    });
  }





  _guid!: string;
  get guid() {
    return this._guid;
  }
  set guid(nv) {
    this.attr(guid, nv);
  }

  attributeChangedCallback(n: string, ov: string, nv: string) {
    switch (n) {
      case guid:
        this._guid = nv;
        break;
    }
    super.attributeChangedCallback(n, ov, nv);
  }



  static get observedAttributes() {
    return super.observedAttributes.concat([guid]);
  }

  connectedCallback() {
    this.propUp([guid]);
    this._masterListId = anySelf[masterListKey]
      ? (anySelf[masterListKey] as string)
      : "9b551c11-9187-11ea-bb21-cdd00df441ba";
    if (!(<any>self)[this._masterListId]) {

      appendTag(document.head, 'purr-sist-jsonblob',
        [{}, {}, {
          id: this._masterListId,
          //write: true,
          //new: true,
          read: true,
          "store-id": this._masterListId
        } as PurrSistAttribs] as PEASettings,{
          host: this,
        }
      )
    }
    super.connectedCallback();
  }
}
define(PublicChoiceJsonBlob);

extend({
  name:'to-frappe-chart-data',
  valFromEvent: e => {
    debugger;
    // const labels = [];
    // for (const key in data) {
    //     if (key.startsWith('_')) continue;
    //     labels.push(key);
    // }
    // if (labels.length === 0) return;
    // const fd = {
    //     title: 'Votes',
    //     data: {
    //         labels: labels,
    //         datasets: [
    //             {
    //                 name: "Votes",
    //                 color: "light-blue",
    //                 values: labels.map(key => isNaN(data[key]) ? 0 : data[key])
    //             }
    //         ]
    //     },
    //     "type": "bar",
    //     "height": 250,
    //     "isNavigable": true
    // };
    // //console.log(fd);
    // (<any>this).data = fd;
  }
})