export function randInt(upper) {
    return Math.floor(Math.random() * upper);
}

export function randChoice(choices) {
    if ( choices.length === 0) return null;
    return choices[randInt(choices.length)];
}

export function shuffle(choices) {
    choices = Array.from(choices);
    const ret = [];
    while (choices.length>0) {
        const i = randInt(choices.length);
        ret.push(choices.splice(i, 1)[0]);
    }
    return ret;
}

export function range(n) {
    const ret = [];
    for (let i=0;i<n;i++) ret.push(i);
    return ret;
}

export function camelize(s) {
    const ret = [];
    let lastIsCh = true;
    for (let c of s.toLowerCase()) {
        if (/[a-zA-Z0-9]/.test(c)) {
            ret.push(c);
            if (!lastIsCh) {
                ret.push(ret.pop().toUpperCase());
            }
            lastIsCh = true;
        } else {
            lastIsCh = false;
        }
    }
    return ret.join('');
}
