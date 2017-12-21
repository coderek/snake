class Delta {
    constructor(time, delta) {
        this.time = time;
        this.delta = delta ;
    }

    merge(delta) {
    }
}

export default class GameStateManager {
    constructor(snapshot) {
        this._snapshot = snapshot;
        this._deltas = [];
    }
}
