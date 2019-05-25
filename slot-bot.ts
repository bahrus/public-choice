import {extend} from 'p-et-alia/p-d-x.js';

extend('slot-bot', {
    valFromEvent: (e: Event) =>{
        const slot = e.target as HTMLSlotElement;
        const ret = slot.assignedElements().map(el => {
            const clone = el.cloneNode(true) as HTMLElement;
            clone.removeAttribute('slot');
            return clone.outerHTML;
        }).join('');
        return ret;
    }
})