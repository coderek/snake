import messageBus from './message.js'; 
import { GAME_START } from './constants.js';

export const popup = new Vue({
    el: '#popup',
    data: {
    },
    methods: {
        start(difficulty) {
            messageBus.broadcast(
                GAME_START,
                difficulty
            );
            this.$el.style.display = 'none';
        }
    }
});


