import { extend } from 'p-et-alia/p-d-x.js';
extend('slot-bot', {
    valFromEvent: (e) => {
        const slot = e.target;
        const ret = slot.assignedElements().map(el => {
            const clone = el.cloneNode(true);
            clone.removeAttribute('slot');
            return clone.outerHTML;
        }).join('');
        return ret;
    }
});
