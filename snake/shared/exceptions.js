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

export class GameOver {
    constructor() {
        this.message = "Game over";
    }
}
