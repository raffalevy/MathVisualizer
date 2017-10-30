const WIDTH = 600;
const HEIGHT = 460;

const RES_FACTOR = 4;

class CoordinateSystem {

    originX : number;
    originY : number;
    unit: number;

    constructor(originX : number, originY : number, unit: number) {
        this.originX = originX;
        this.originY = originY;
        this.unit = unit;
    }

    x(inX : number) : number {
        return this.unit * inX + this.originX;
    }

    y(inY : number) : number {
        return HEIGHT - (this.unit * inY + this.originY);
    }

}

class ParametricFunction {
    x : (number) => number;
    y : (number) => number;

    constructor(xFunc: (number) => number, yFunc: (number) => number) {
        this.x = xFunc;
        this.y = yFunc;
    }
}

function drawAxes(ctx : CanvasRenderingContext2D, cs: CoordinateSystem) {
    ctx.save();

    ctx.strokeStyle = '#DDDDDD';

    ctx.beginPath();
    ctx.moveTo(cs.x(1), cs.y(0) - 5);
    ctx.lineTo(cs.x(1), cs.y(0) + 5);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cs.x(0) - 5, cs.y(1));
    ctx.lineTo(cs.x(0) + 5, cs.y(1));
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#BBBBBB';

    ctx.beginPath();
    ctx.moveTo(0, cs.y(0));
    ctx.lineTo(WIDTH, cs.y(0));
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cs.x(0), 0);
    ctx.lineTo(cs.x(0), HEIGHT);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

function drawParametricCurve(p: ParametricFunction, start: number, end: number, step: number, ctx : CanvasRenderingContext2D, cs: CoordinateSystem) {
    const pX = p.x;
    const pY = p.y;
    ctx.beginPath();
    ctx.moveTo(cs.x(pX(start)), cs.y(pY(start)));
    for (let t = start + step; t <= end; t += step) {
        ctx.lineTo(cs.x(pX(t)), cs.y(pY(t)));
    }
    ctx.moveTo(cs.x(pX(end)), cs.y(pY(end)));
    ctx.stroke();
}

const canvas = <HTMLCanvasElement>document.getElementById('visualizer');

canvas.setAttribute('width', (WIDTH*RES_FACTOR).toString());
canvas.setAttribute('height', (HEIGHT*RES_FACTOR).toString());

const ctx = canvas.getContext('2d');

ctx.scale(RES_FACTOR,RES_FACTOR);

const cs = new CoordinateSystem(WIDTH/2, HEIGHT/2, 20);

let p = undefined;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;

    drawAxes(ctx, cs);

    if (p) {
        drawParametricCurve(p, -3, 3, .1, ctx, cs);
    }
}

const xInput = <HTMLInputElement>document.getElementById('xInput');
const yInput = <HTMLInputElement>document.getElementById('yInput');
const xTex = <HTMLSpanElement>document.getElementById('xTex');
const yTex = <HTMLSpanElement>document.getElementById('yTex');

function onInput() {

    const xNode : any = math.parse(xInput.value);
    const yNode : any = math.parse(yInput.value);

    const LEFTDELIM = "\\(";
    const RIGHTDELIM = "\\)";

    if (xNode != 'undefined') {
        xTex.innerHTML = LEFTDELIM + xNode.toTex() + RIGHTDELIM;
    } else {
        xTex.innerHTML = "";
    }

    if (yNode != 'undefined') {
        yTex.innerHTML = LEFTDELIM + yNode.toTex() + RIGHTDELIM;
    } else {
        yTex.innerHTML = "";
    }

    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

    if (xNode != 'undefined' && yNode != 'undefined') {
        p = new ParametricFunction(t => xNode.compile().eval({t:t}), t => yNode.compile().eval({t:t}));
    } else {
        p = undefined;
    }

    draw();
}

xInput.addEventListener('input', onInput);
yInput.addEventListener('input', onInput);

draw();