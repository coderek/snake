/* global superagent */
export default class Connection {

    constructor(roomsUpdater) {

        this._callbacks = new Map();

        superagent.get('/rooms').then( res => {
            roomsUpdater(res.body) 
        });

    }

    subscribe(ev, cb) {
        if (!this._callbacks.has(ev)) {
            this._callbacks.set(ev, new Set());
        }
        this._callbacks.get(ev).add(cb);
    }

    createRoom(cb) {
    }

    joinRoom(room, cb) {
        const _sock = this._sock = io('/'+room);
        _sock.on('message', console.log);
        cb()
    }

    send(msg, cb) {
        this._sock.emit('message', msg, cb);
    }

    dispose() {
        this._callbacks.clear();
    }

    _broadcast(ev, ...args) {
        if (this._callbacks.has(ev)) {
            for (let cb of this._callbacks.get(ev)) {
                cb(...args);
            }
        }
    }
}

