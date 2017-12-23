import messageBus from './message.js'; 
import { GAME_START, GAME_OVER, GAME_SCORE } from './constants.js';
import { NUM_OF_PERSONAL_BEST_TO_SHOW } from './config.js';

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


let lastStoppedTime = null;
let gameRunning = false;
const scoreBoard = new Vue({
    el: '#side-menu',
    data: {
        points: 0,
        time: 0,
        _records: []
    },
    created() {
        lastStoppedTime = Date.now();
        this.records = JSON.parse(localStorage.records);
    },
    computed: {
        records: {
            get() {
                return this.sortedRecords(this._records).slice(0, NUM_OF_PERSONAL_BEST_TO_SHOW);
            },
            set(rds) {
                this._records = rds || [];
            }
        },
        efficiency () {
            if (this.time === 0) return 0;
            return (this.points/this.time).toFixed(1);
        }
    },
    methods: {
        sortedRecords(rds) {
            return rds.sort((a,b)=> {
                if (b.score - a.score !== 0 ) {
                    return b.score - a.score
                }
                if (a.time - b.time !== 0) {
                    return a.time - b.time;
                }
                return 0;
            });
        },
        onGameScore() {
            this.points++;
        },
        onGameStart() {
            gameRunning = true;
            lastStoppedTime = Date.now();
            this.points = 0;

            function updateTime() {
                if (gameRunning) {
                    const now = Date.now();
                    scoreBoard.time = ~~((now - lastStoppedTime)/1000);
                    requestAnimationFrame(updateTime);
                }
            }
            updateTime();
        },
        onGameOver() {
            gameRunning = false;
            this.records.push({
                score: this.points,
                time: this.time,
                efficiency: this.efficiency
            });
            localStorage.setItem('records', JSON.stringify(this.records));
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

messageBus.subscribe(scoreBoard, GAME_OVER); 
messageBus.subscribe(scoreBoard, GAME_START); 
messageBus.subscribe(scoreBoard, GAME_SCORE);
