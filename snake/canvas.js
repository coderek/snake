
class Canvas {
    constructor(config) {
        let {parentId, w, h, bg} = config;
        const parent = document.getElementById(parentId);

        w = w || 800;
        h = h || 800;
        bg = bg || '#345';

        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.bg = bg;
        parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    clear(x, y, w, h) {
        this.ctx.clearRect(x, y, w, h);
    }

}



export default Canvas;
