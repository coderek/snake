import stage from './canvas.js';
import Snake from './snake.js';
import FoodGenertor from './food_generator.js';
import { randInt, randChoice } from 'util.js';

const TILE_COLOR = '#ddd';
const EVENT_INTERVAL = 100; // update move every 100ms
export const STARTED = 'started';
export const UNINITIALIZED = 'started';

export default class Game {
    constructor(playerCount=1) {
        this.state = UNINITIALIZED;
        this.playerCount = playerCount;
        this._screen = [];
        this.snakes = [];
        this._foodGenerator = new FoodGenertor(this);
        this.h = 50;
        this.w = 50;
        this._initPixels();
        this._initSnakes();
        this.start(  );
    }

    getRandomEmptyPixel() {
        const x = randInt(this.h);
        const emptyPixels = this._screen[x]
            .map( (p, y) => [p, y])
            .filter( tuple => tuple[0] === TILE_COLOR );
        const randomPixel = randChoice(emptyPixels);
        return [x, randomPixel[1]];
    }

    _initListeners() {
        window.addEventListener('keypress', k => {
            this.snakes[0].onKeyPressed(k.keyCode);
        });
    }

    _initPixels() {
        for (let i=0;i<this.h;i++) {
            this._screen.push(Array(this.w).fill(TILE_COLOR));
        }
    }

    _initSnakes() {
        for (let i=0;i<this.playerCount;i++) {
            if (i==0) {
                this.snakes.push(new Snake(this, false));
                this._initListeners();
            } else {
                this.snakes.push(new Snake(this, true));
            }
        }
    }

    isInScreen(x, y) {
        return 0<=x && x<this.h && 0<=y && y<this.w;
    }

    _render() {
        this._resetScreen();

        this._renderSnakes();
        this._renderFoods();

        this._rasterize();
    }

    _resetScreen() {
        for (let i=0;i<this.h;i++) {
            for (let j=0;j<this.w;j++) {
                this._screen[i][j] = TILE_COLOR;
            }
        }
    }

    _rasterize() {
        const h = 1/this.h;
        const w = 1/this.w;

        for (let i=0;i<this.h;i++) {
            const ii = i/this.h;
            for (let j=0;j<this.w;j++) {
                const jj = j/this.w;
                stage.drawRectPercent(jj, ii, h, w, this._screen[i][j]);
            }
        }
    }

    _renderFoods() {
        for (let food of this._foodGenerator) {
            const [x, y] = food.tile;
            this._screen[x][y] = food.color;
        }
    }

    _renderSnakes() {
        for (let snake of this.snakes) {
            for (let [x, y] of snake.tiles) {
                this._screen[x][y] = snake.color;
            }
        }
    }

    _eatFood(x, y) {
        return this._foodGenerator.eat(x, y);
    }

    _move() {
        for (let snake of this.snakes) {
            const [x, y] = snake.move();
            if (this._eatFood(x, y)) {
                snake.grow();
            }
        }
    }

    tick(time) {
        this._move();
        this._foodGenerator.generate();
    }

    start() {
        this._state = STARTED;
        const loop = (time) => {
            if ( !this._lastUpdate || time - this._lastUpdate > EVENT_INTERVAL ) {
                this.tick(time);
                this._lastUpdate = time;
            }
            this._render();
            requestAnimationFrame(loop);
        };
        loop();
    }
}
