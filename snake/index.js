import './ui/ui.js';
import Game from './core/game.js';
import { GAME_START, KEY_DOWN } from './shared/constants.js';
import messageBus from './shared/message.js'; 
import neonLightEffect from './ui/text_effect.js';

const game = new Game(3, 0);

messageBus.subscribe(game, GAME_START);
messageBus.subscribe(game, KEY_DOWN);

window.addEventListener('keydown', k => {
    const first = game.snakes[0];
    if (first) 
        messageBus.broadcast(KEY_DOWN, first.id, k);
});

// render top menu
const topMenu = document.getElementById('top-menu');
neonLightEffect(topMenu.getContext('2d'));
