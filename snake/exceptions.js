export class NoMoveException extends Error {
    constructor() {
        super('No more move');
    }
};
