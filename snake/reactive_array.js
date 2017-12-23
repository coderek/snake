export default function ReactiveArrayFactory(callbacks, data=[]) {

    return new Proxy(data, {
        get(target, prop) {
            const val = target[prop];
            if (typeof val === 'function') {
                if (prop in callbacks) {
                    return function (el) {
                        if (typeof callbacks[prop] === 'function') {
                            callbacks[prop](...arguments, data);
                        }
                        if (typeof callbacks[prop]['pre'] === 'function') {
                            callbacks[prop]['pre'](...arguments, data);
                        }
                        const ret = Array.prototype[prop].apply(target, arguments);
                        if (typeof callbacks[prop]['post'] === 'function') {
                            callbacks[prop]['post'](ret, data);
                        }
                        return ret;
                    }
                }
                return val.bind(target);
            }
            return val;
        }
    });
}

