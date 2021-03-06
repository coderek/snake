import { AISnakeFactory, Snake } from './snake.js';
import FoodGenertor from './food_generator.js';
import stage from './canvas.js';

import messageBus from '../shared/message.js'; 
import { GameOver } from '../shared/exceptions.js';
import { randInt, randChoice, guid } from '../shared/util.js';
import { STARTED, UNINITIALIZED, GAME_OVER, GAME_SCORE } from '../shared/constants.js';
import { TILE_COLOR, EVENT_INTERVAL } from '../config.js';

export default class Game {
    constructor(playerCount=1, aiCount=2, width=40, height=40) {
        this._state = UNINITIALIZED;
        this._screen = [];
        this._difficulty =  'easy';
        this._snakes = [];
        this._foodGenerator = null;
        this._playerCount = playerCount;
        this._aiCount = aiCount;

        this.id = guid();
        this.height = height;
        this.width = width;

        _initPixels.call(this);
        _initialRender.call(this);
    }

    get snakes() {
        return this._snakes;
    }

    onGameStart(difficulty) {
        this._difficulty = difficulty;
        _reset.call(this);
        _countDown.call(this, 3, _start.bind(this));
    }

    onKeyDown(sid, key) {
        const snake = this._snakes.find(s=>s.id === sid);
        if (snake) 
            snake.onKeyPressed(key.keyCode);
    }

    /**
     * Pick a random empty tile on the map
     */
    getRandomEmptyPixel() {
        const x = randInt(this.height);
        const emptyPixels = this._screen[x]
            .map( (p, y) => [p, y])
            .filter( tuple => tuple[0] === TILE_COLOR );
        const randomPixel = randChoice(emptyPixels);
        return [x, randomPixel[1]];
    }

    /**
     * Return if the given (x,y) is inside the game boundary
     */
    isInScreen(x, y) {
        return 0<=x && x<this.height && 0<=y && y<this.width;
    }

    /**
     * Return coordinates of all the foods on the map
     */
    foodCoords() {
        return [...this._foodGenerator].map( food => food.tile );
    }

}

// private methods

function _countDown(duration, cb) {
    const that = this;
    function count() {
        if (duration <= 0) {
            cb();
            return;
        }
        duration--;
        _render.call(that);
        stage.drawText(duration+1+'', 100, 100);
        setTimeout(count, 1000);
    }

    count();
}

function _initialRender() {
    _resetScreen.call(this);
    _rasterize.call(this);
}


function _initFoodGenerator() {
    if (this._foodGenerator) {
        this._foodGenerator.dispose();
    }
    this._foodGenerator = new FoodGenertor(this);
}


function _initPixels() {
    for (let i=0;i<this.height;i++) {
        this._screen.push(Array(this.width).fill(TILE_COLOR));
    }
}

function _initSnakes() {
    if (this._snakes && this._snakes.length) {
        this._snakes.forEach( s => s.dispose() );
    }
    this._snakes = [];

    for (let i=0;i<this._playerCount;i++) {
        this._snakes.push(new Snake(this));
    }

    for (let i=0;i<this._aiCount;i++) {
        this._snakes.push(AISnakeFactory(this));
    }
}


function _render() {
    _resetScreen.call(this);

    _renderSnakes.call(this);
    _renderFoods.call(this);

    _rasterize.call(this);
}

function _move() {
    for (let snake of this._snakes) {
        if (snake.isDead) {
            if (snake === this._snakes[0]) {
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

        if (_eatFood.call(this, x, y)) {
            snake.grow();
            if (snake === this._snakes[0]) {
                messageBus.broadcast(GAME_SCORE);
            }
        }
    }
}


function _resetScreen() {
    stage.clear();
    for (let i=0;i<this.height;i++) {
        for (let j=0;j<this.width;j++) {
            this._screen[i][j] = TILE_COLOR;
        }
    }
}

function _rasterize() {
    const h = 1/this.height;
    const w = 1/this.width;

    for (let i=0;i<this.height;i++) {
        const ii = i/this.height;
        for (let j=0;j<this.width;j++) {
            const jj = j/this.width;
            stage.drawRectPercent(jj, ii, h, w, this._screen[i][j]);
        }
    }
}

function _renderFoods() {
    for (let food of this._foodGenerator) {
        const [x, y] = food.tile;
        this._screen[x][y] = food.color;
    }
}

function _renderSnakes() {
    for (let snake of this._snakes) {
        for (let i=0;i<snake.tiles.length;i++) {
            const [x, y] = snake.tiles[i];
            if (snake === this._snakes[0] && i < 2) {
                if ( i === 0 ) {
                    this._screen[x][y] = 'red';
                } else {
                    this._screen[x][y] = 'orange';
                }
            } else {
                this._screen[x][y] = snake.color;
            }
        }
    }
}

function _eatFood(x, y) {
    return this._foodGenerator.eat(x, y);
}

function _tick() {
    _move.call(this);
    this._foodGenerator.generate();
}

function _finish() {
    messageBus.broadcast(GAME_OVER, {
        id: this.id,
        difficulty: this._difficulty
    });
}

function _start() {
    this._state = STARTED;
    const loop = (time) => {
        if ( !this._lastUpdate || time - this._lastUpdate > EVENT_INTERVAL ) {
            try {
                _tick.call(this, time);
            } catch (e) {
                if ( e instanceof GameOver ) {
                    _render.call(this);
                    _finish.call(this);
                    return;
                }
            }
            this._lastUpdate = time;
        }
        _render.call(this);
        requestAnimationFrame(loop);
    };
    loop();
}

function _reset() {
    _initPixels.call(this);
    _initSnakes.call(this);
    _initFoodGenerator.call(this);
}

