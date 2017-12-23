
class Canvas {
    constructor(config) {
        let {parentId, w, h, bg} = config;
        const parent = document.getElementById(parentId);

        this.w = w || 400;
        this.h = h || 400;
        bg = bg || '#345';

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.bg = bg;
        parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    drawRectPercent(x, y, w, h, color) {
        x = x * this.w;
        w = w * this.w;
        y = y * this.h;
        h = h * this.h;

        this.drawRect(x, y, w-1, h-1, color);
    }

    clear(x=0, y=0, w=this.w, h=this.h) {
        this.ctx.clearRect(x, y, w, h);
    }

    drawText(txt, x, y) {
        this.ctx.fillStyle = '#09f';
        this.ctx.font = '48px serif';
        this.ctx.fillText(txt, x, y);
    }
}


const stage = new Canvas({
    parentId: 'container', 
    bg: '#f2f2f2'
});


export default stage;
