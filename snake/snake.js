import { STARTED, UNINITIALIZED } from './game.js';
import { randInt, shuffle, range } from './util.js';
import { Dead, NoMoveException } from './exceptions.js';

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
const _tileMap = {};
const tileHash = (x, y) => x * 100000000 + y;

function TileMapFactory( sid ) {
    const tiles = [];
    return new Proxy(tiles, {
        get(target, prop) {
            const val = target[prop];
            if (typeof val === 'function') {
                if (['push', 'unshift'].includes(prop)) {
                    return function (el) {
                        _tileMap[tileHash(...el)] = sid;
                        return Array.prototype[prop].apply(target, arguments);
                    }
                }
                if (['pop'].includes(prop)) {
                    return function () {
                        const el = Array.prototype[prop].apply(target, arguments);
                        delete _tileMap[tileHash(...el)];
                        return el;
                    }
                }
                return val.bind(target);
            }
            return val;
        }
    });
}


export class Snake {
    constructor(game) {
        this._id = _idGenerator ++;
        this._len = 5;
        this._game = game;
        this._tiles = TileMapFactory(this._id);
        this._init();
        this._isDead = false;
    }

    get tiles() {
        return this._tiles;
    }

    get color() {
        return COLORS[this._id];
    }

    get isDead() {
        return this._isDead;
    }

    set isDead(dead) {
        this._isDead = dead;
    }

    onKeyPressed(key) {
        this._keyPressed = key;
    }

    grow() {
        this._tiles.push(this._lastPopped);
    }

    move() {
        let [nx, ny] = this._findNextMove(...this._tiles[0]);
        this._lastPopped = this._tiles.pop();
        this._tiles.unshift([nx, ny]);
        return [nx, ny];
    }

    _isValidMove(x, y) {
        if (!this._game.isInScreen(x, y))
            return false;
        if (tileHash(x, y) in _tileMap)
            return false;
        return true;
    }

    _getRandDir(sx, sy) {
        for (let i of shuffle(range(4))) {
            const [nx, ny] = [sx + dir[i], sy + dir[i+1]]
            if (this._isValidMove(nx, ny))
                return i;
        }
        throw new NoMoveException;
    }

    _isSnake(x, y) {
        return this._tiles.some( t => t[0] === x && t[1] === y);
    }

    _findNextMove(sx, sy) {
        let d;
        if (this._keyPressed == null && this._lastDir == null) {
            d = this._lastDir = this._getRandDir(sx, sy);
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
        if (this._isValidMove(nx, ny)) {
            return [nx, ny];
        }
        throw new Dead;
    }

    _init() {
        let [sx, sy] = [randInt(this._game.h), randInt(this._game.w)];

        for (let i=0;i<this._len;i++) {
            this._tiles.push([sx, sy]);
            const d = this._getRandDir(sx, sy);
            [sx, sy] = [sx + dir[d], sy + dir[d+1]];
        }

        this._tiles.push([sx, sy]);
    }

}

const AI_STATE_PATROL = '_patrol';
const AI_STATE_ATTACK = '_attack';
const AI_STATE_RACE = '_race';

class AISnake extends Snake {

    // return dir
    _patrol(x, y) {
        if (!this._patrolSteps || this._patrolSteps.length === 0) {
            const d = randInt(4);
            const rep = randInt(10);
            this._patrolSteps = Array(rep).fill(d);
        }
        return this._patrolSteps.pop();
    }

    // return dir
    _attack() {
    }

    // return dir
    _race(x, y, tx, ty) {
        if (x===tx && ty===y) {
            return this._getRandDir(x, y);
        }
        let moves = [];
        if (y!==ty) {
            moves.push(ty>y? 1: 3);
        }
        if (x!==tx) {
            moves.push(tx>x? 2: 0);
        }
        moves = shuffle(moves);
        for (let i=0;i<4;i++) {
            if (moves.indexOf(i) === -1) {
                moves.push(i);
            }
        }
        for (let i of moves) {
            const [nx, ny] = [x + dir[i], y + dir[i+1]]
            if (this._isValidMove(nx, ny))
                return i;
        }
        throw new NoMoveException;
    }
}

export class EasySnake extends AISnake {
    constructor() {
        super(...arguments);
        console.log('AI snake');
    }

    move () {
        return super.move();
    }

    _isSmartMove(x, y) {
        const selfLen = this._tiles.length;
        const borders = new Set();
        const visited = new Set();
        const q = [[x, y]];

        while (q.length) {
            const l = q.length;

            for (let j=0;j<l;j++) {
                const p = q.shift();
                const [fx, fy] = p;
                for (let i=0;i<4;i++) {
                    const [nx, ny] = [fx+dir[i], fy+dir[i+1]];
                    const hash = tileHash(nx, ny);
                    if (visited.has(hash)) {
                        continue;
                    }
                    visited.add(hash);
                    if (this._isValidMove(nx, ny)) {
                        q.push([nx, ny]);
                    }
                }
            }
            if (q.length > selfLen) {
                return true;
            }
        }
        return false;
    }

    _findNextMove(sx, sy, call=0) {
        if (call >= 100) {
            throw new Dead;
        }
        const foods = this._game.foodCoords();
        let d;
        // if (foods.length) {
        //     d = this._race(sx, sy, foods[0][0], foods[0][1]);
        // } else {
            d = this._patrol(sx, sy);
        // }
        const coords = [sx + dir[d], sy + dir[d+1]];
        if (this._isValidMove(...coords) && this._isSmartMove(...coords)) {
            return coords;
        } else {
            return this._findNextMove(sx, sy, ++call);
        }
    }
}
