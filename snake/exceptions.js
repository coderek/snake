export class NoMoveException {
    constructor(msg) {
        this.message = msg;
    }
};

export class Dead {
    constructor() {
        this.message = "Dead";
    }
};
