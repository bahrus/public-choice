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
import {update} from 'trans-render/update.js';
export const masterListKey = Symbol('masterListKey');
const anySelf = (<any>self);

const mainTemplate = createTemplate(/* html */`
<main>
    <section role="question">
        <slot name="question"></slot>
    </section>
    <xtal-radio-group-md name="pronoun">
        <slot name="options"></slot>
    </xtal-radio-group-md>
    <p-d on="value-changed" to="purr-sist-myjson[write]" prop="pc_vote" m="1"></p-d>
    <purr-sist-myjson data-role="persist" read></purr-sist-myjson>
    <p-d on="value-changed" prop="value"></p-d>
    <purr-sist-myjson data-role="persist" write></purr-sist-myjson>
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
    _masterListId!: string;

    _initContext = newRenderContext({
        main:{
            //section: 'What is your favorite pronoun?',
            [PurrSistMyJson.is]: ({target}) => decorate(target as HTMLElement, {
                propVals:{
                    masterListId: '/' + this._masterListId,
                } as PurrSistMyJson,
            }),
            ['[data-role="persist"][write]']: ({target}) => decorate(target as HTMLElement, {
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
                                if(labels.length === 0) return;
                                const fd = {
                                    title: 'Votes',
                                    data:{
                                        labels: labels,
                                        datasets:[
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
                                (<any>this).data = fd;
                                break;
                        }

                    }
                }
            })
        }
        
    });
    get initContext(){return this._initContext;}

    _updateContext = newRenderContext({
        main:{
            //section: 'What is your favorite pronoun?',
            [PurrSistMyJson.is]: ({target}) => decorate(target as HTMLElement, {
                attribs:{
                    [guid]: this._guid,
                },
            }),
        }
    })
    get updateContext(){
        this._updateContext.update = update;
        return this._updateContext;
    }

    _guid!: string;
    get guid(){
        return this._guid;
    }
    set guid(nv){
        this.attr(guid, nv);
    }

    attributeChangedCallback(n: string, ov: string, nv: string){
        switch(n){
            case guid:
                this._guid = nv;
                break;
        }
        super.attributeChangedCallback(n, ov, nv);
    }
    
    get ready(){
        return this._guid !== undefined;
    }

    static get observedAttributes(){
        return super.observedAttributes.concat([guid]);
    }

    connectedCallback(){
        this[up]([guid]);
        this._masterListId = anySelf[masterListKey] ? anySelf[masterListKey] as string : 'yv8uy';
        if(!(<any>self)[this._masterListId]){
            appendTag(document.head, PurrSistMyJson.is, {
                attribs:{
                    id: this._masterListId,
                    read: true,
                    'store-id': 'yv8uy'
                }
                
            } as DecorateArgs);
        }
        super.connectedCallback();

    }


}
define(PublicChoice);