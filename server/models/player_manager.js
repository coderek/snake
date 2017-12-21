import Collection from '../helpers/collection';


export default class PlayerManager extends Collection {
    constructor() {
        super(...arguments);
        this.players = new Collection();
    }

    onPlayerConnect(m) {
        const player = new PlayerConnection();
        this.players.push(player);
    }

    onPlayerDrop(m) {
        this.delete(m.playerId);
    }

    messageToClient(m) {
    }

}
