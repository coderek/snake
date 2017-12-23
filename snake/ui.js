import messageBus from './message.js'; 
import { GAME_START, GAME_OVER } from './constants.js';

const startGame = new Vue({
    el: '#start-game',
    mounted() {
        show(this);
    },
    methods: {
        start(difficulty) {
            messageBus.broadcast(
                GAME_START,
                difficulty
            );
            hide(this);
        }
    }
});



const endGame = new Vue({
    el: '#end-game',
    mounted() {
        hide(this);
    },
    methods: {
        showStart() {
            hide(this);
            show(startGame);
        },
        onGameOver() {
            show(this);
        }
    }
});


function show(instance) {
    instance.$el.style.display = 'block';
}

function hide(instance) {
    instance.$el.style.display = 'none';
}

messageBus.subscribe(endGame, GAME_OVER); 
