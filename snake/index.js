import './ui.js';
import Game from './game.js';
import { GAME_START } from './constants.js';
import messageBus from './message.js'; 
import neonLightEffect from './text-effect.js';


// const StateMachine = {
//     [UNINITIALIZED]: [STARTED],
//     [STARTED]: [PAUSED, FINISHED]
// }

const game = new Game();

messageBus.subscribe(game, GAME_START);

window.addEventListener('keydown', k => {
    game.onKeyDown(k);
});

const topMenu = document.getElementById('top-menu');
neonLightEffect(topMenu.getContext('2d'));
