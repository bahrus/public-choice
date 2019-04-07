import {XtalElement} from 'xtal-element/xtal-element.js';
import {createTemplate, newRenderContext} from 'xtal-element/utils.js';
import 'xtal-material/xtal-radio-group-md.js';
import {define} from 'trans-render/define.js';
import {PurrSistMyJson} from 'purr-sist/purr-sist-myjson.js';
import {decorate} from 'trans-render/decorate.js';
import { PurrSist } from 'purr-sist/purr-sist.js';
import 'p-d.p-u/p-d.js';
import {XtalFrappeChart} from 'xtal-frappe-chart/xtal-frappe-chart.js';
import {appendTag} from 'trans-render/appendTag.js';
import { DecorateArgs } from '../trans-render/init.d.js';
import {up} from 'trans-render/hydrate.js';
const masterListId = 'yv8uy';
const mainTemplate = createTemplate(/* html */`
<main>
    <section role="question">
        <slot name="question"></slot>
    </section>
    <xtal-radio-group-md name="pronoun">
        <slot name="options"></slot>
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

const guid = 'guid';
export class PublicChoice extends XtalElement{
    static get is(){return 'public-choice';}
    get mainTemplate(){
        return mainTemplate;
    }
    _initContext = newRenderContext({
        main:{
            //section: 'What is your favorite pronoun?',
            [PurrSistMyJson.is]: ({target}) => decorate(target as HTMLElement, {
                propVals:{
                    masterListId: '/' + masterListId,
                } as PurrSistMyJson,
            }),
            [PurrSistMyJson.is + '[write]']: ({target}) => decorate(target as HTMLElement, {
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
            [XtalFrappeChart.is]: ({target}) => decorate(target as HTMLElement,{
                propDefs:{
                    rawData: null,
                    //frappeFormat: null,
                },
                methods:{
                    onPropsChange: function(propName: string, data: any){
                        
                        switch(propName){
                            case 'rawData':
                                const labels = [];
                                for(const key in data){
                                    if(key.startsWith('_')) continue;
                                    labels.push(key);
                                }
                                const fd = {
                                    title: 'Votes',
                                    data:{
                                        labels: labels,
                                        datasets:[
                                            {
                                                name: "Votes",
                                                color: "light-blue",
                                                values: labels.map(key => data[key])
                                            }
                                        ]
                                    },
                                    "type": "bar", 
                                    "height": 250,
                                    "isNavigable": true
                                };
                                console.log(fd);
                                (<any>this).data = fd;
                                break;
                        }
                        // const frappeData = {
                        //     "title": "My Awesome Chart",
                        //     "data": {
                        //       "labels": ["12am-3am", "3am-6am", "6am-9am", "9am-12pm",
                        //         "12pm-3pm", "3pm-6pm", "6pm-9pm", "9pm-12am"],
                          
                        //       "datasets": [
                        //         {
                        //           "name": "Some Data", "color": "light-blue",
                        //           "values": [25, 40, 30, 35, 8, 52, 17, -4]
                        //         },
                        //         {
                        //           "name": "Another Set", "color": "violet",
                        //           "values": [25, 50, -10, 15, 18, 32, 27, 14]
                        //         },
                        //         {
                        //           "name": "Yet Another", "color": "blue",
                        //           "values": [15, 20, -3, -15, 58, 12, -17, 37]
                        //         }
                        //       ]
                        //     },
                        //     "type": "bar", 
                        //     "height": 250,
                        //     "isNavigable": true
                        //   }
                    }
                }
            })
        }
        
    });
    get initContext(){return this._initContext;}

    get ready(){return true;}

    static get observedAttributes(){
        return super.observedAttributes.concat([guid]);
    }

    connectedCallback(){
        this[up]([guid]);
        if(!(<any>self)[masterListId]){
            appendTag(document.head, PurrSistMyJson.is, {
                attribs:{
                    id: masterListId,
                    read: true,
                    'store-id': 'yv8uy'
                }
                
            } as DecorateArgs);
        }
        super.connectedCallback();

    }


}
define(PublicChoice);