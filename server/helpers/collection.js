export default class Collection {
    constructor(name) {
        this._collection = this[name];
    }

    findIdx(id) {
        return this._collection.findIndex( p => p.id === id );
    }

    find(id) {
        const idx = this.findIdx(id);
        if (idx >=0 ) {
            return this._collection[idx];
        }
        return null;
    }

    delete(id) {
        const idx = this.findIdx(id);
        if (idx >=0 ) {
            this._collection.splice(idx, 1);
        }
    }

    [Symbol.iterator]() {
        return this._collection[Symbol.iterator]();
    }
}

