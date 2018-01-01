import { NUM_OF_PERSONAL_BEST_TO_SHOW } from './config.js';

export default class ResultsManager {
    constructor() {
        this.store = this._sortedRecords(this._loadInitialData());
    }

    push(el) {
        this.store.push(el);
        this.store = this._sortedRecords(this.store);
        this._saveData();
    }

    _loadInitialData() {
        const data = localStorage.getItem('records');
        if (data) 
            return JSON.parse(data);
        return [];
    }

    _saveData() {
        localStorage.setItem('records', JSON.stringify(this.store));
    }

    _sortedRecords(rds) {
        return rds.sort((a,b)=> {
            if (b.score - a.score !== 0 ) {
                return b.score - a.score;
            }
            if (a.time - b.time !== 0) {
                return a.time - b.time;
            }
            return 0;
        });
    }

    get(difficulty) {
        return this.store.filter(s => s.difficulty === difficulty).slice(
            0, NUM_OF_PERSONAL_BEST_TO_SHOW);
    }
}
