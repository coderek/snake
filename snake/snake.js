import { STARTED, UNINITIALIZED } from './game.js';
import { randInt, shuffle, range } from './util.js';
import { Dead } from './exceptions.js';

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
            const d = this._getRandDir(sx, sy);
            [sx, sy] = [sx + dir[d], sy + dir[d+1]];
        }

        this.tiles.push([sx, sy]);
    }

    onKeyPressed(key) {
        this._keyPressed = key;
    }

    _getRandDir(sx, sy) {
        for (let i of shuffle(range(4))) {
            const [nx, ny] = [sx + dir[i], sy + dir[i+1]]
            if (this._game.isInScreen(nx, ny) && !this._isSnake(nx, ny))
                return i;
        }
        throw new NoMoveException;
    }

    _findNextMove(sx, sy) {
        let d;
        if (this._keyPressed == null && this._lastDir == null) {
            this._lastDir = this._getRandDir(sx, sy);
        } else if (this._keyPressed != null) {
            d = KEYCODE[this._keyPressed];
            // do nothing when it's towards the opposite direction
            if (this._lastDir == null || (this._lastDir + d) % 2 === 1) {
                this._lastDir = d;
            } else {
                d = this._lastDir;
            }
            this._keyPressed = null;
        } else {
            // follow previous dir
            d = this._lastDir;
        }

        const [nx, ny] = [sx + dir[d], sy + dir[d+1]];
        if (this._game.isInScreen(nx, ny)) {
            return [nx, ny];
        }
        throw new Dead;
    }

    _isSnake(x, y) {
        return this.tiles.some( t => t[0] === x && t[1] === y);
    }

    grow() {
        this.tiles.push(this._lastPopped);
    }

    move() {
        let nx, ny;
        try {
            [nx, ny] = this._findNextMove(...this.tiles[0]);
        } catch (e) {
            console.error(e.message);
            return this.tiles[0];
        }
        this._lastPopped = this.tiles.pop();
        this.tiles.unshift([nx, ny]);
        return [nx, ny];
    }

}
