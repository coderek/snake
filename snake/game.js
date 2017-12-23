import messageBus from './message.js'; 
import stage from './canvas.js';
import { GameOver } from './exceptions.js';
import { Snake, EasySnake } from './snake.js';
import FoodGenertor from './food_generator.js';
import { randInt, randChoice } from 'util.js';
import { STARTED, UNINITIALIZED, PAUSED, FINISHED, GAME_OVER } from './constants.js';

const TILE_COLOR = '#ddd';
const EVENT_INTERVAL = 200; // update move every 100ms

export default class Game {
    constructor(playerCount=2, width=20, height=20) {
        this._state = UNINITIALIZED;
        this.playerCount = playerCount;
        this._screen = [];
        this.h = height;
        this.w = width;
        this._initPixels();

        this._initialRender();
        console.log('game start');
    }

    onGameStart() {
        this.reset();
        this.start();
    }

    onPaused() {
    }

    onFinished() {
    }

    onKeyDown(k) {
        if (this.snakes && this.snakes.length)
            this.snakes[0].onKeyPressed(k.keyCode);
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
                try {
                    this.tick(time);
                } catch (e) {
                    if ( e instanceof GameOver ) {
                        this._render();
                        this.finish();
                        return;
                    }
                }
                this._lastUpdate = time;
            }
            this._render();
            requestAnimationFrame(loop);
        };
        loop();
    }

    finish() {
        messageBus.broadcast(GAME_OVER);
    }

    reset() {
        this._initPixels();
        this._initSnakes();
        this._initFoodGenerator();
    }

    foodCoords() {
        return [...this._foodGenerator].map( food => food.tile );
    }

    _initialRender() {
        this._resetScreen();
        this._rasterize();
    }

    _initFoodGenerator() {
        if (this._foodGenerator) {
            this._foodGenerator.dispose();
        }
        this._foodGenerator = new FoodGenertor(this);
    }

    _initPixels() {
        for (let i=0;i<this.h;i++) {
            this._screen.push(Array(this.w).fill(TILE_COLOR));
        }
    }

    _initSnakes() {
        if (this.snakes && this.snakes.length) {
            this.snakes.forEach( s => s.dispose() );
        }
        this.snakes = [];
        for (let i=0;i<this.playerCount;i++) {
            if (i==0) {
                this.snakes.push(new Snake(this));
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
                if (snake === this.snakes[0] && i === 0) {
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
                if (snake === this.snakes[0]) {
                    throw new GameOver();
                }
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
