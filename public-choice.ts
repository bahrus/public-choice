import {XtalElement} from 'xtal-element/xtal-element.js';
import {createTemplate, newRenderContext} from 'xtal-element/utils.js';
import 'xtal-material/xtal-radio-group-md.js';
import {define} from 'xtal-element/define.js';
import {PurrSistMyJson} from 'purr-sist/purr-sist-myjson.js';
import {decorate} from 'trans-render/decorate.js';
import { PurrSist } from '../purr-sist/purr-sist';
import 'p-d.p-u/p-d.js';
import {XtalFrappeChart} from 'xtal-frappe-chart/xtal-frappe-chart.js';
const masterListId = 'yv8uy';
const mainTemplate = createTemplate(/* html */`
<!-- <purr-sist-myjson id="master" read store-id="yv8uy"></purr-sist-myjson> -->
<main>
    <section role="question">
    Who are you?
    </section>
    <xtal-radio-group-md name="pronoun">
        <slot></slot>
    </xtal-radio-group-md>
    <p-d on="value-changed" to="purr-sist-myjson[write]" prop="pc_vote" m="1"></p-d>
    <purr-sist-myjson read guid="951c3b69-3e16-4f62-915b-ba3ca33a8e77"></purr-sist-myjson>
    <p-d on="value-changed" prop="value"></p-d>
    <purr-sist-myjson write guid="951c3b69-3e16-4f62-915b-ba3ca33a8e77"></purr-sist-myjson>
    <p-d on="value-changed" prop="rawData"></p-d>
    <xtal-frappe-chart></xtal-frappe-chart>
</main>
`);
const already_voted = 'already-voted';


export class PublicChoice extends XtalElement{
    static get is(){return 'public-choice';}
    get mainTemplate(){
        return mainTemplate;
    }
    _initContext = newRenderContext({
        main:{
            section: 'hi',
            [PurrSistMyJson.is]: ({target}) => decorate<PurrSistMyJson>(target as PurrSistMyJson, {
                propVals:{
                    masterListId: '/' + masterListId,
                } as PurrSistMyJson,
            }),
            [PurrSistMyJson.is + '[write]']: ({target}) => decorate<PurrSistMyJson>(target as PurrSistMyJson, {
                    propDefs:{
                        pc_vote: null
                    },
                    methods:{
                        onPropsChange: function(propName: string, val: string){
                            switch(propName){
                                case 'pc_vote':
                                    const _this = (<any>this) as PurrSist
                                    const newVal = _this.newVal ||  _this.value;
                                    if(!newVal[val]){
                                        newVal[val] = 0;
                                    }
                                    newVal[val]++;
                                    _this.newVal = {...newVal};
                                    console.log(newVal);
                                    break;
                            }
                        }
                    }
                }
            ),
            [XtalFrappeChart.is]: ({target}) => decorate<XtalFrappeChart>(target as XtalFrappeChart,{
                propDefs:{
                    rawData:null
                },
                methods:{
                    onPropsChange: function(){
                        debugger;
                    }
                }
            })
        }
        
    });
    get initContext(){return this._initContext;}

    get ready(){return true;}

    connectedCallback(){
        if(!(<any>self)[masterListId]){
            const purrSistMaster = document.createElement(PurrSistMyJson.is) as PurrSistMyJson;
            decorate<PurrSistMyJson>(purrSistMaster, {
                attribs:{
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