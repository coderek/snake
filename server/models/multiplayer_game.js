import { guid } from '../helpers/util.js';
import PlayerManager from './player_manager.js';
import GameStateManager from './gamestate_manager.js';

const CONTROL_STATE = {
    INIT: 0b1,
    STARTED: 0b10,
};

/**
 * Game controller that runs a multiplayer game
 */
export default class MultiplayerGame {

    constructor(game) {
        this._id = guid();

        this._state = new GameStateManager(game.getInitialState());
        this._game = game;
        this._players = new PlayerManager();
    }

    onGameStart() {}
    onPlayerJoin() {}
    onPlayerLeave() {}
    onPlayerMove() {}



    onMessage(m) {
        if (this._isControlMessage(m)) {
            this._handleControlMessage(m);
        } else {
            this._clients.messageToClient(m);
        }
    }

    _isControlMessage(m) {
    }

    _handleControlMessage(m) {
    }

    _nextGameState(time) {
        this._deltas.push({
            time,
            delta: this._game.tick(time)
        });
    }

    _sendState(client) {
        const state = this._state.computeDelta(client.lastAck);
        client.send(state);
    }

    _tick(time) {
        this._nextGameState();

        for (const client of this._players) {
            this._sendState(client);
        }
    }
}
