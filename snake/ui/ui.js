/* global Vue */
import messageBus from '../shared/message.js'; 
import ResultsManager from './results.js';
import { GAME_START, GAME_OVER, GAME_SCORE } from '../shared/constants.js';
import { NUM_OF_PERSONAL_BEST_TO_SHOW } from '../config.js';
import Connection from './connection.js';

let conn = null;

const multiplayerView = new Vue({
    el: '#multiplayer',
    data: {
        rooms: []
    },
    mounted() {
        hide(this);
        if (conn) conn.dispose();

        conn = new Connection(rooms=>this.rooms=rooms);

        conn.subscribe('message', (msg)=> {
            console.log('received: ' + msg);
        });
    },
    methods: {
        createRoom() {
            conn.createRoom(()=> this.showRoom());
        },
        join(room) {
            conn.joinRoom(room, ()=> this.showRoom());
        },
        showRoom(r) {
            conn.send('hello');
            console.log('show room ' + r);
        }
    }
});

const startGame = new Vue({
    el: '#start-game',
    mounted() {
        show(this);
    },
    data: {
        difficulty: null
    },
    methods: {
        start(difficulty) {
            messageBus.broadcast(
                GAME_START,
                difficulty
            );
            this.difficulty = difficulty;
            hide(this);
        },
        multiplayer() {
            hide(this);
            show(multiplayerView);
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
const records = new ResultsManager();
const scoreBoard = new Vue({
    el: '#side-menu',
    data: {
        points: 0,
        time: 0
    },
    created() {
        lastStoppedTime = Date.now();
    },
    computed: {
        efficiency () {
            if (this.time === 0) return 0;
            return (this.points*100/this.time).toFixed(1);
        },
        difficulty: {
            cache: false,
            get() {
                return startGame.difficulty;
            }
        },
        records: {
            cache: false,
            get() {
                return records.get(this.difficulty);
            }
        }
    },
    methods: {
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
        onGameOver(gameInfo) {
            gameRunning = false;
            if (records.length < NUM_OF_PERSONAL_BEST_TO_SHOW || this.points)
                records.push(Object.assign(gameInfo, {
                    score: this.points,
                    time: this.time,
                    efficiency: this.efficiency
                }));
            this.$forceUpdate();
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
