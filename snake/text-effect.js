/* eslint quotes: 0 */
/// Neon light text-effect
function getBlurValue(blur) {
    var userAgent = navigator.userAgent;
    if (userAgent && userAgent.indexOf('Firefox/4') != -1) {
        var kernelSize = (blur < 8 ? blur / 2 : Math.sqrt(blur * 2));
        var blurRadius = Math.ceil(kernelSize);
        return blurRadius * 2;
    }
    return blur;
}

var createInterlace = function (size, color1, color2) {
    var proto = document.createElement("canvas").getContext("2d");
    proto.canvas.width = size * 2;
    proto.canvas.height = size * 2;
    proto.fillStyle = color1; // top-left
    proto.fillRect(0, 0, size, size);
    proto.fillStyle = color2; // top-right
    proto.fillRect(size, 0, size, size);
    proto.fillStyle = color2; // bottom-left
    proto.fillRect(0, size, size, size);
    proto.fillStyle = color1; // bottom-right
    proto.fillRect(size, size, size, size);
    var pattern = proto.createPattern(proto.canvas, "repeat");
    pattern.data = proto.canvas.toDataURL();
    return pattern;
};

var op_8x8 = createInterlace(8, "#FFF", "#eee");

var image = document.createElement("img");
image.width = 42;
image.height = 1;
image.src = op_8x8.data;
image.style.cssText = "display: inline";

function getMetrics (text, font) {
    var metrics = document.getElementById("metrics");
    var parent;
    if (metrics) {	
        metrics.style.cssText = "display: block";
        parent = metrics.firstChild;
        parent.firstChild.textContent = text;
    } else {
        // setting up html used for measuring text-metrics
        parent = document.createElement("span");
        parent.appendChild(document.createTextNode(text));
        parent.appendChild(image);
        metrics = document.createElement("div");
        metrics.id = "metrics";
        metrics.appendChild(parent);
        document.body.insertBefore(metrics, document.body.firstChild);
    }

    // direction of the text
    var direction = window.getComputedStyle(document.body, "")["direction"];

    // getting css equivalent of ctx.measureText()
    parent.style.cssText = "font: " + font + "; white-space: nowrap; display: inline;";
    var width = parent.offsetWidth;
    var height = parent.offsetHeight;

    // capturing the "top" and "bottom" baseline
    parent.style.cssText = "font: " + font + "; white-space: nowrap; display: block;";
    var top = image.offsetTop;
    var bottom = top - height;

    // capturing the "middle" baseline
    parent.style.cssText = "font: " + font + "; white-space: nowrap; line-height: 0; display: block;";
    var middle = image.offsetTop + 1;

    // capturing "1em"
    parent.style.cssText = "font: " + font + "; white-space: nowrap; height: 1em; display: block;";
    parent.firstChild.textContent = "";
    var em = parent.offsetHeight;

    // cleanup
    metrics.style.display = "none";

    return {
        direction: direction,
        top: top,
        em: em,
        middle: middle,
        bottom: bottom,
        height: height,
        width: width
    };
}

export default function neonLightEffect(ctx) {
    var text = "Snake redux";
    var font = '100px Futura, Helvetica, sans-serif';
    var jitter = 25; // the distance of the maximum jitter
    var offsetX = 30;
    var offsetY = 70;
    var blur = getBlurValue(100);
    // save state
    ctx.save();
    ctx.font = font;
    // calculate width + height of text-block
    var metrics = getMetrics(text, font);
    // create clipping mask around text-effect
    ctx.rect(offsetX - blur/2, offsetY - blur/2, offsetX + metrics.width + blur, metrics.height + blur);
    ctx.clip();
    // create shadow-blur to mask rainbow onto (since shadowColor doesn't accept gradients)
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,1)";
    ctx.shadowOffsetX = metrics.width + blur;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = blur;
    ctx.fillText(text, -metrics.width + offsetX - blur, offsetY + metrics.top);
    ctx.restore();
    // create the rainbow linear-gradient
    var gradient = ctx.createLinearGradient(0, 0, metrics.width, 0);
    gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
    gradient.addColorStop(0.15, "rgba(255, 255, 0, 1)");
    gradient.addColorStop(0.3, "rgba(0, 255, 0, 1)");
    gradient.addColorStop(0.5, "rgba(0, 255, 255, 1)");
    gradient.addColorStop(0.65, "rgba(0, 0, 255, 1)");
    gradient.addColorStop(0.8, "rgba(255, 0, 255, 1)");
    gradient.addColorStop(1, "rgba(255, 0, 0, 1)");
    // change composite so source is applied within the shadow-blur
    ctx.globalCompositeOperation = "source-atop";
    // apply gradient to shadow-blur
    ctx.fillStyle = gradient;
    ctx.fillRect(offsetX - jitter/2, offsetY, metrics.width + offsetX, metrics.height + offsetY);
    // change composite to mix as light
    ctx.globalCompositeOperation = "lighter";
    // multiply the layer
    ctx.globalAlpha = 0.7;
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.globalAlpha = 1;
    // draw white-text ontop of glow
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(text, offsetX, offsetY + metrics.top);
    // created jittered stroke
    ctx.lineWidth = 0.80;
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    var i = 10; while(i--) {
        var left = jitter / 2 - Math.random() * jitter;
        var top = jitter / 2 - Math.random() * jitter;
        ctx.strokeText(text, left + offsetX, top + offsetY + metrics.top);
    }
    ctx.strokeStyle = "rgba(0,0,0,0.20)";
    ctx.strokeText(text, offsetX, offsetY + metrics.top);
    ctx.restore();
}
