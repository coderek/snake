import stage from './canvas.js'; 
import Snake from './snake.js';

const TILE_COLOR = '#ddd';
export const STARTED = 'started';
export const UNINITIALIZED = 'started';

export default class Game {
    constructor(playerCount=1) {
        this.state = UNINITIALIZED;
        this.playerCount = playerCount;
        this._screen = [];
        this.snakes = [];
        this.h = 50;
        this.w = 50;
        this._initPixels();
        this._initSnakes();
        this.start();
    }

    _initListeners() {
        window.addEventListener('keypress', k => {
            this.snakes[0].onKeyPressed(k.keyCode);
        });
    }

    _initPixels() {
        for (let i=0;i<this.h;i++) {
            this._screen.push(Array(this.w).fill(0));
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

    _renderSnakes() {
        for (let snake of this.snakes) {
            for (let [x, y] of snake.tiles) {
                this._screen[x][y] = snake.color;
            }
        }
    }

    _move() {
        for (let snake of this.snakes) {
            snake.move();
        }
    }

    start() {
        const that = this;
        let lastUpdate = performance.now();

        function loop(time) {
            if ( time - lastUpdate > 100 ) {
                that._move();
                lastUpdate = time;
            }
            that._render();
            requestAnimationFrame(loop);
        }
        this._state = 'started';
        loop();
    }
}
