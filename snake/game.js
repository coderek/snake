import stage from './canvas.js'; 
import { randInt } from './util.js';

const TILE_COLOR = '#ddd';
const SNAKE_COLOR = '#222';
const dir = [-1, 0, 1, 0, -1];
const KEYCODE = {
    37: 3, // 'ArrowLeft',
    38: 0, // 'ArrowUp',
    39: 1, // 'ArrowRight',
    40: 2, // 'ArrowDown',
};

export default class Game {
    constructor() {
        this.board = [];
        this.h = 50;
        this.w = 50;
        this._initBoard();
        this._initSnakes();
        this._initListeners();
        this.start();
    }

    _initListeners() {
        window.addEventListener('keypress', k => {
            this._keyPressed = k.keyCode;
        });
    }

    _initBoard() {
        for (let i=0;i<this.h;i++) {
            this.board.push(Array(this.w).fill(0));
        }
    }

    _initSnakes() {
        const len = 5;
        let [sx, sy] = [randInt(this.h), randInt(this.w)];
        this.snake = [];

        for (let i=0;i<len;i++) {
            this.snake.push([sx, sy]);
            this.board[sx][sy] = 1;
            [sx, sy] = this._findNextMove(sx, sy);
        }
    }

    _render() {
        this._renderBoard();
    }

    _renderBoard() {
        const h = 1/this.h;
        const w = 1/this.w;

        for (let i=0;i<this.h;i++) {
            const ii = i/this.h;
            for (let j=0;j<this.w;j++) {
                const jj = j/this.w;
                let color = TILE_COLOR;
                if (this.board[i][j] === 1) {
                    color = SNAKE_COLOR;
                }
                stage.drawRectPercent(jj, ii, h, w, color);
            }
        }
    }

    _validMove(x,y) {
        return 0<=x && x<this.h && 0<=y && y<this.w && this.board[x][y] == 0;
    }

    _findNextMove(sx, sy) {
        if (this._state === 'started') {
            let d;
            if (this._keyPressed == null && this._lastDir == null) {
                do {
                    d = randInt(4);
                } while (!this._validMove(sx+dir[d], sy+dir[d+1]));
                this._lastDir = d;
            } else if (this._keyPressed != null) {
                d = KEYCODE[this._keyPressed+''];
                if (this._lastDir == null || (this._lastDir + d) % 2 === 1) {
                    this._lastDir = d;
                } else {
                    d = this._lastDir;
                }
                this._keyPressed = null;
            } else {
                d = this._lastDir;
            }
            const [nx, ny] = [sx + dir[d], sy + dir[d+1]];
            if (this._validMove(nx, ny)) {
                return [nx, ny];
            }
        } else {
            for (let j=0;j<4;j++) {
                const [nx, ny] = [sx + dir[j], sy + dir[j+1]];
                if (0<=nx && nx<this.h && 0<=ny && ny<this.w && this.board[nx][ny] == 0) {
                    return [nx, ny];
                }
            }
        }
        throw "No move";
    }

    _move() {
        const [tx, ty] = this.snake.pop();
        this.board[tx][ty] = 0;
        const [nx, ny] = this._findNextMove(...this.snake[0]);
        this.board[nx][ny] = 1;
        this.snake.unshift([nx, ny]);
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
