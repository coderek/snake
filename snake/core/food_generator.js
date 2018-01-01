class Food {
    constructor(x, y) {
        this.tile = [x, y];
    }
}

class Apple extends Food {
    constructor() {
        super(...arguments);
        this.color = 'green';
    }
}

export default class FoodGenertor {
    constructor(game) {
        this._game = game;
        this._current = new Map();
    }

    generate() {
        if ( !this._current.has(Apple) ) {
            const [x, y] = this._game.getRandomEmptyPixel();
            this._current.set(Apple, new Apple(x, y));
        }
    }

    [Symbol.iterator]() {
        return this._current.values();
    }

    /**
     * given x and y return if it matches one of the foods
     * if it matches, that food will be removed
     */
    eat(x, y) {
        let eaten = null;
        for (let [key, food] of this._current.entries()) {
            if (food.tile[0] === x && food.tile[1] === y) {
                eaten = key;
                break;
            }
        }
        if (eaten) {
            this._current.delete(eaten);
            return true;
        }
        return false;
    }

    dispose() {
        this._current = new Map();
    }
}
