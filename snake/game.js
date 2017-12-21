import stage from './canvas.js';
import { Snake, EasySnake } from './snake.js';
import FoodGenertor from './food_generator.js';
import { randInt, randChoice } from 'util.js';

const TILE_COLOR = '#ddd';
const EVENT_INTERVAL = 200; // update move every 100ms
export const STARTED = 'started';
export const UNINITIALIZED = 'started';

export default class Game {
    constructor(playerCount=2) {
        this.state = UNINITIALIZED;
        this.playerCount = playerCount;
        this._screen = [];
        this.snakes = [];
        this._foodGenerator = new FoodGenertor(this);
        this.h = 20;
        this.w = 20;
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

    isInScreen(x, y) {
        return 0<=x && x<this.h && 0<=y && y<this.w;
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

    foodCoords() {
        return [...this._foodGenerator].map( food => food.tile );
    }

    _initListeners() {
        window.addEventListener('keydown', k => {
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
                this.snakes.push(new Snake(this));
                this._initListeners();
            } else {
                this.snakes.push(new EasySnake(this));
            }
        }
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
            for (let i=0;i<snake.tiles.length;i++) {
                const [x, y] = snake.tiles[i];
                if (i === 0) {
                    this._screen[x][y] = 'red';
                } else {
                    this._screen[x][y] = snake.color;
                }
            }
        }
    }

    _eatFood(x, y) {
        return this._foodGenerator.eat(x, y);
    }

    _move() {
        for (let snake of this.snakes) {
            if (snake.isDead) {
                continue;
            }
            let x, y;
            try {
                [x, y] = snake.move();
            } catch (e) {
                console.log(`Snake ${snake._id} is dead`);
                snake.isDead = true;
                continue;
            }

            if (this._eatFood(x, y)) {
                snake.grow();
            }
        }
    }
}
