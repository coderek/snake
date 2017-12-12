import { STARTED, UNINITIALIZED } from './game.js';
import { randInt } from './util.js';
import { NoMoveException } from './exceptions.js';

const dir = [-1, 0, 1, 0, -1];
const KEYCODE = {
    37: 3, // 'ArrowLeft',
    38: 0, // 'ArrowUp',
    39: 1, // 'ArrowRight',
    40: 2, // 'ArrowDown',
};

const COLORS = [
    '#0048BA',
    '#B0BF1A',
    '#7CB9E8',
    '#C9FFE5',
    '#B284BE',
    '#00308F',
];

let _idGenerator = 1;

export default class Snake {
    constructor(game, ai=false) {
        this._id = _idGenerator ++;
        this._len = 5;
        this.color = COLORS[this._id];
        this._game = game;
        this.tiles = [];
        this._init();
    }

    _init() {
        let [sx, sy] = [randInt(this._game.h), randInt(this._game.w)];
        this.tiles = [];

        for (let i=0;i<this._len;i++) {
            this.tiles.push([sx, sy]);
            [sx, sy] = this._findNextMove(sx, sy);
        }
    }

    onKeyPressed(key) {
        this._keyPressed = key;
    }

    _findNextMove(sx, sy) {
        if (this._game.state === STARTED) {
            let d;
            if (this._keyPressed == null && this._lastDir == null) {
                do {
                    d = randInt(4);
                } while (!this._game.isInScreen(sx+dir[d], sy+dir[d+1]));
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
            if (this._game.isInScreen(nx, ny)) {
                return [nx, ny];
            }
        } else if (this._game.state === UNINITIALIZED) {
            for (let j=0;j<4;j++) {
                const [nx, ny] = [sx + dir[j], sy + dir[j+1]];
                if (this._game.isInScreen(nx, ny) && !this._isSnake(nx, ny))
                    return [nx, ny];
            }
        }
        throw new NoMoveException;
    }

    _isSnake(x, y) {
        return this.tiles.any( t => t[0] === x && t[1] === y);
    }

    move() {
        const [tx, ty] = this.tiles.pop();
        const [nx, ny] = this._findNextMove(...this.tiles[0]);
        this.tiles.unshift([nx, ny]);
    }

}
