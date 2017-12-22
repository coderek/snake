import popup from './ui.js';
import Game from './game.js';
import { GAME_START } from './constants.js';
import messageBus from './message.js'; 


// const StateMachine = {
//     [UNINITIALIZED]: [STARTED],
//     [STARTED]: [PAUSED, FINISHED]
// }

const game = new Game();

messageBus.subscribe(game, GAME_START);
