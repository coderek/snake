import Canvas from './canvas.js'; 

const stage = new Canvas({
    parentId: 'container', 
    bg: '#543'
});

stage.drawRect(0, 0, 100, 100, '#345');

stage.drawRect(101, 101, 100, 100, '#345');

stage.clear(50, 50, 100, 100);
