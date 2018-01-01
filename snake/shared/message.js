import {camelize} from './util.js';
const callbacks = new Map();

export default {
    broadcast(msg, payload) {
        if ( callbacks.has(msg) ) {
            for (let cb of callbacks.get(msg)) {
                cb.call(null, payload);
            }
        }
    },
    subscribe(obj, msg) {
        const method = camelize('on_'+msg);
        if (typeof obj[method] === 'function') {
            if ( !callbacks.has(msg)) {
                callbacks.set(msg, []);
            }
            callbacks.get(msg).push(obj[method].bind(obj));
        }
    }
};
