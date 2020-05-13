import { XtalElement, define } from "xtal-element/XtalElement.js";
import { SelectiveUpdate, AttributeProps} from 'xtal-element/types.d.js';
import { createTemplate } from "trans-render/createTemplate.js";
import { PurrSistAttribs} from "purr-sist/purr-sist.js";
import { appendTag } from "trans-render/appendTag.js";
import { TransformRules, PEASettings  } from "trans-render/types.d.js";
import {extend} from 'p-et-alia/p-d-x.js';
import 'purr-sist/purr-sist-jsonblob';
import('if-diff/if-diff.js');
import('purr-sist/purr-sist-idb.js');
import('xtal-radio-group-md/xtal-radio-group-md.js');
import 'xtal-frappe-chart/xtal-frappe-chart.js';

export const masterListKey = Symbol("masterListKey");
const anySelf = <any>self;
const mainTemplate = createTemplate(/* html */ `
<main>
    <section role=question>
        <slot name=question></slot>
    </section>
    <!-- Read from local storage whether user has voted already. -->
    <purr-sist-idb read db-name=pc_vote store-name=user_status -store-id disabled></purr-sist-idb>

    <!-- If already voted, hide options and display the results and vice versa -->
    <p-d on=value-changed to=if-diff[-lhs] m=2 skip-init></p-d>
    <if-diff if -lhs not_equals rhs=voted data-key-name=allowVoting m=1></if-diff>
    <if-diff if -lhs equals rhs=voted data-key-name=allowViewResults m=2></if-diff>

    <xtal-radio-group-md name=pronoun data-allow-voting=-1 disabled=2>
      <!-- Options to vote on, passed in via light children.  -->
      <slot name=options></slot>
    </xtal-radio-group-md>
    <!-- Pass vote to purr-sist-* elements for persisting.  -->
    <p-d-x-mark-voted on=value-changed to=purr-sist-idb[-new-val] m=1 skip-init></p-d-x-mark-voted>
    <p-d-x-increment-vote on=value-changed to=purr-sist-jsonblob[-new-val] m=1 skip-init></p-d-x-increment-vote>
    <!-- Store whether person already voted.  Put in local storage. -->
    <purr-sist-idb write db-name=pc_vote -master-list-id  -store-id store-name=user_status -new-val></purr-sist-idb>
    
    
    <!-- Retrieve vote tally from jsonblob detail record. -->
    <purr-sist-jsonblob read -guid -master-list-id ></purr-sist-jsonblob>
    <!-- Initialize writer to current value. --> 
    <p-d on=value-changed prop=value></p-d>
    <!-- Persist vote to jsonblob detail record linked to master list. -->
    <purr-sist-jsonblob -master-list-id write -guid -new-val></purr-sist-jsonblob>



    <!-- pass persisted votes to chart element -->
    <p-d-x-to-frappe-chart-data on=value-changed to=[-data] skip-init></p-d-x-to-frappe-chart-data>
    <div data-allow-view-results="0">
      <template><xtal-frappe-chart -data></xtal-frappe-chart></template>
    </div>
    
</main>
`);

const guid = "guid";

export class PublicChoiceJsonBlob extends XtalElement {
  static get is() {
    return 'public-choice-jsonblob';
  }

  static attributeProps = ({disabled, guid} : PublicChoiceJsonBlob) => ({
      boolean: [disabled],
      string: [guid],
  }  as AttributeProps);
  
  get readyToInit() {
    return this.guid !== undefined;
  }
  readyToRender = true;

  mainTemplate = mainTemplate;

  initTransform = {} as TransformRules;

  updateTransforms = [
    ({guid} : PublicChoiceJsonBlob) => ({
      main:{
        '[-store-id]': guid, 
        '[-guid]': guid,
      }
    }) as TransformRules,
    ({masterListId} : PublicChoiceJsonBlob) =>({
      main:{
        '[-master-list-id]': '/' + masterListId
      }
    })
  ] as SelectiveUpdate[];



  _masterListId!: string;
  get masterListId(){
    return this._masterListId;
  }
  set masterListId(nv){
    this._masterListId = nv;
    this.onPropsChange('masterListId');
  }

  guid: string | undefined;

  connectedCallback() {
    this.propUp([guid]);
    super.connectedCallback();
    const masterListId = anySelf[masterListKey]
      ? (anySelf[masterListKey] as string)
      : "9b551c11-9187-11ea-bb21-cdd00df441ba";
    if (!(<any>self)[masterListId]) {

      appendTag(document.head, 'purr-sist-jsonblob',
        [{}, {}, {
          id: masterListId,
          read: true,
          "store-id": masterListId
        } as PurrSistAttribs] as PEASettings,{
          host: this,
        }
      )
    }
    this.masterListId = masterListId;
  }
}
define(PublicChoiceJsonBlob);

declare global {
  interface HTMLElementTagNameMap {
      "public-choice-jsonblob": PublicChoiceJsonBlob,
  }
}

extend({
  name:'mark-voted',
  valFromEvent: e=>{
    return 'voted';
  }
})

extend({
  name:'to-frappe-chart-data',
  valFromEvent: e => {
    const data = (<any>e).detail!.value;
    const labels = [];
    for (const key in data) {
        if (key.startsWith('_')) continue;
        labels.push(key);
    }
    if (labels.length === 0) return;
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
    return fd;
  }
});



extend({
  name:'increment-vote',
  valFromEvent: function(e: Event){
    const option = (<any>e).detail!.value;
    const match = (<any>this).getMatches((<any>this)._pdNavDown)[0];
    let newVal = match.value;
    if(typeof newVal !== 'object'){
      newVal = {};
    }
    if(newVal[option] === undefined){
      newVal[option] = 1;
    }else{
      newVal[option]++;
    }
    return newVal;
  }
})


