import * as React from "react";
import {ReactElement, ReactHTMLElement} from "react";

import * as math from 'mathjs';

export interface ParametricFunctionParams {
    p: ParametricFunction,
    pStart: number,
    pEnd: number,
    pStep: number
}

export class CoordinateSystem {

    readonly originX: number;
    readonly originY: number;
    readonly unit: number;

    constructor(originX: number, originY: number, unit: number) {
        this.originX = originX;
        this.originY = originY;
        this.unit = unit;
    }

    x(inX: number): number {
        return this.unit * inX + this.originX;
    }

    y(inY: number): number {
        return Plotter.HEIGHT - (this.unit * inY + this.originY);
    }

    invX(inX: number): number {
        return (inX - this.originX) / this.unit;
    }

    invY(inY: number) {
        return (Plotter.HEIGHT - inY - this.originY) / this.unit;
    }

    withUnit(newUnit) : CoordinateSystem {
        return new CoordinateSystem(this.originX, this.originY, newUnit);
    }

}

export class ParametricFunction {
    x: (number) => number;
    y: (number) => number;

    constructor(xFunc: (number) => number, yFunc: (number) => number) {
        this.x = xFunc;
        this.y = yFunc;
    };
}

/**
 * Represents a 2D vector
 */
export class Vector2D {
    readonly x: number;
    readonly y: number;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    magnitude() : number {
        return math.sqrt(this.x**2 + this.y**2);
    }

    transform(f: (x: number) => number, g? : (y: number) => number) : Vector2D {
        if (!g) {
            g = f;
        }

        return new Vector2D(f(this.x), g(this.y));
    }

    unitVector() : Vector2D {
        return this.transform((x) => x / this.magnitude());
    }

    /**
     * Scalar multiplication
     * @param {number} a
     */
    times(a : number) : Vector2D{
        return this.transform(x => x * a);
    }

    /**
     * Vector addition
     * @param {Vector2D} v
     * @returns {Vector2D}
     */
    plus(v : Vector2D) : Vector2D {
        return this.transform(x => x + v.x, y => y + v.y);
    }

    minus(v: Vector2D) : Vector2D {
        return this.plus(v.times(-1));
    }
}

export interface VectorField {
    (x: number, y: number): Vector2D
}

/**
 * Functions for transforming vector fields
 */
export namespace VectorField {
    export function add(f: VectorField, g: VectorField) {
        return (x,y) => f(x,y).plus(g(x,y));
    }

    export function subtract(f: VectorField, g: VectorField) {
        return VectorField.add(f, multiply(g, -1));
    }

    export function multiply(f: VectorField, a: number) {
        return (x,y) => f(x,y).times(a);
    }
}

export interface PlotterProps {
    parametricFunctions?: ParametricFunctionParams[]
    vectorFields?: VectorField[]
    unit?: number
}

interface PlotterState {
    ctx: CanvasRenderingContext2D,
    cs: CoordinateSystem,
    parametricFunctions?: ParametricFunctionParams[]
    vectorFields?: VectorField[]
}

export class Plotter extends React.Component<PlotterProps, PlotterState> {

    static readonly WIDTH = 600;
    static readonly HEIGHT = 460;

    static readonly DEFAULT_UNIT = 20;

    static readonly RES_FACTOR = 4;

    static readonly VECTOR_LENGTH = 10;

    static readonly CANVAS_STYLE = {
        border: "solid 1px gray",
        width: Plotter.WIDTH.toString() + "px",
        height: Plotter.HEIGHT.toString() + "px"
    };

    canvas = undefined;
    canvasRef = undefined;

    constructor(props: PlotterProps) {
        super(props);
        this.state = {
            ctx: null,
            cs: new CoordinateSystem(Plotter.WIDTH / 2, Plotter.HEIGHT / 2, this.props.unit || Plotter.DEFAULT_UNIT),
            parametricFunctions: props.parametricFunctions,
            vectorFields: props.vectorFields
        };
    }

    render() {
        this.canvas = (
            <canvas ref={(canvasRef) => this.canvasRef = canvasRef} width={Plotter.WIDTH * Plotter.RES_FACTOR}
                    height={Plotter.HEIGHT * Plotter.RES_FACTOR} style={Plotter.CANVAS_STYLE}>Canvas not
                supported.</canvas>
        );
        return this.canvas;
    }

    componentDidMount() {
        const ctx = this.canvasRef.getContext('2d');
        this.setState({ctx: ctx}, () => {
            ctx.scale(Plotter.RES_FACTOR, Plotter.RES_FACTOR);

            this.draw();
        });
    }

    componentDidUpdate() {
        this.draw();
    }

    componentWillReceiveProps(nextProps : PlotterProps) {
        this.setState({
            parametricFunctions: nextProps.parametricFunctions,
            vectorFields: nextProps.vectorFields,
            cs: this.state.cs.withUnit(nextProps.unit)
        });
    }

    draw() {
        if (this.props.unit == 0) {
            return;
        }

        const ctx = this.state.ctx;

        ctx.clearRect(0, 0, Plotter.WIDTH, Plotter.HEIGHT);

        ctx.lineWidth = 2;

        this.drawAxes();

        if (this.props.parametricFunctions) {
            this.props.parametricFunctions.forEach(params => {
                if (params) this.drawParametricCurve(params.p, params.pStart, params.pEnd, params.pStep);
            });
        }

        if (this.props.vectorFields) {
            this.props.vectorFields.forEach(f => {
                if (f) {
                    this.drawVectorField(f);
                    //this.drawFieldLine(f, -.25, .25, .01, 500);
                }
            });
        }
    }

    drawAxes() {
        const ctx = this.state.ctx;
        const cs = this.state.cs;

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
        ctx.lineTo(Plotter.WIDTH, cs.y(0));
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cs.x(0), 0);
        ctx.lineTo(cs.x(0), Plotter.HEIGHT);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    drawParametricCurve(p: ParametricFunction, start: number, end: number, step: number) {
        if (start >= end || step === 0) {
            return;
        }

        const ctx = this.state.ctx;
        const cs = this.state.cs;

        const pX = p.x;
        const pY = p.y;
        ctx.beginPath();
        ctx.moveTo(cs.x(pX(start)), cs.y(pY(start)));
        for (let t = start + step; t <= end; t += step) {
            ctx.lineTo(cs.x(pX(t)), cs.y(pY(t)));
        }
        ctx.lineTo(cs.x(pX(end)), cs.y(pY(end)));
        ctx.stroke();
    }

    /**
     * Draw a vector as an arrow at the given coordinates
     * @param {Vector2D} v
     * @param {number} x
     * @param {number} y
     */
    drawVector(v: Vector2D, x: number, y: number) {
        const length = Plotter.VECTOR_LENGTH * math.log10(v.magnitude() + 1) * 2;
        const scaledV = v.unitVector().transform(x => x * length);

        const ctx = this.state.ctx;
        const cs = this.state.cs;

        ctx.beginPath();
        ctx.moveTo(cs.x(x), cs.y(y));
        ctx.lineTo(cs.x(x) + scaledV.x, cs.y(y) - scaledV.y);
        ctx.stroke();
    }

    /**
     * Draw a vector field
     * @param {VectorField} f
     */
    drawVectorField(f : VectorField) {
        const ctx = this.state.ctx;
        const cs = this.state.cs;

        const startX = cs.invX(0);
        const startY = cs.invY(Plotter.HEIGHT);

        const endX = cs.invX(Plotter.WIDTH);
        const endY = cs.invY(0);

        const step = Plotter.VECTOR_LENGTH * 1.5 / cs.unit;

        for (let x = startX; x <= endX; x = x + step) {
            for (let y = startY; y <= endY; y = y + step) {
                this.drawVector(f(x,y), x, y);
            }
        }
    }

    drawFieldLine(f : VectorField, startX: number, startY: number, stepFactor: number, steps: number) {
        const ctx = this.state.ctx;
        const cs = this.state.cs;

        ctx.beginPath();
        ctx.moveTo(cs.x(startX), cs.y(startY));

        let x = startX;
        let y = startY;

        for (let stepsElapsed = 0; stepsElapsed < steps; stepsElapsed++) {
            const newX = x + f(x,y).x * stepFactor;
            const newY = y + f(x,y).y * stepFactor;

            x = newX;
            y = newY;

            ctx.lineTo(cs.x(x),cs.y(y));
        }

        ctx.stroke();
    }
}