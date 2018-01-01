import './ui.js';
import Game from './game.js';
import { GAME_START, KEY_DOWN } from './constants.js';
import messageBus from './message.js'; 
import neonLightEffect from './text-effect.js';

const game = new Game();

messageBus.subscribe(game, GAME_START);
messageBus.subscribe(game, KEY_DOWN);

window.addEventListener('keydown', k => {
    messageBus.broadcast(KEY_DOWN, k);
});

// render top menu
const topMenu = document.getElementById('top-menu');
neonLightEffect(topMenu.getContext('2d'));
