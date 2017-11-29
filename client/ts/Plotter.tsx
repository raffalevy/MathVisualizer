import * as React from "react";
import { ReactElement, ReactHTMLElement } from "react";

import * as math from 'mathjs';

/**
 * Parameters representing how a parametric function is to be drawn
 */
export interface ParametricFunctionParams {
    p: ParametricFunction,
    pStart: number,
    pEnd: number,
    pStep: number
}

/**
 * Used to transform between plot coordinates and screen coordinates
 */
export class CoordinateSystem {

    /**
     * The X coordinate of the origin
     */
    readonly originX: number;

    /**
     * The Y coordinate of the origin
     */
    readonly originY: number;

    /**
     * The number of pixels which cooresponds to one unit on the plot
     */
    readonly unit: number;

    constructor(originX: number, originY: number, unit: number) {
        this.originX = originX;
        this.originY = originY;
        this.unit = unit;
    }

    /**
     * Transform plot X to screen X
     * @param inX 
     */
    x(inX: number): number {
        return this.unit * inX + this.originX;
    }

    /**
     * Transform plot Y to screen Y
     * @param inY 
     */
    y(inY: number): number {
        return Plotter.HEIGHT - (this.unit * inY + this.originY);
    }

    /**
     * Transform screen X to plot X
     * @param inX 
     */
    invX(inX: number): number {
        return (inX - this.originX) / this.unit;
    }

    /**
     * Transform screen Y to plot Y
     * @param inY 
     */
    invY(inY: number) {
        return (Plotter.HEIGHT - inY - this.originY) / this.unit;
    }

    /**
     * Return an identical coordinate system to this one using a different unit
     * @param newUnit
     */
    withUnit(newUnit): CoordinateSystem {
        return new CoordinateSystem(this.originX, this.originY, newUnit);
    }

}

/**
 * Represents a 2d parametric function
 */
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

    /**
     * Get this vector's magnitude on the Euclidean plane
     */
    magnitude(): number {
        return math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * Apply a function to the components of this vector
     * @param f The transformation to apply to the X component. This will also be applied to the Y component if no second function is given.
     * @param g The transformation to apply to the Y component.
     */
    transform(f: (x: number) => number, g?: (y: number) => number): Vector2D {
        if (!g) {
            g = f;
        }

        return new Vector2D(f(this.x), g(this.y));
    }

    /**
     * Returns a vector pointing in the same direction as this one with a magnitude of 1.
     */
    unitVector(): Vector2D {
        return this.transform((x) => x / this.magnitude());
    }

    /**
     * Multiply this vector by a scalar
     * @param {number} a The scalar to multiply by
     */
    times(a: number): Vector2D {
        return this.transform(x => x * a);
    }

    /**
     * Add another vector to this one
     * @param {Vector2D} v The vector to add
     * @returns {Vector2D} The sum of the two vectors
     */
    plus(v: Vector2D): Vector2D {
        return this.transform(x => x + v.x, y => y + v.y);
    }

    /**
     * Subtract a vector from this one
     * @param v The vector to subtrace
     * @returns {Vector2D} The difference of the vectors
     */
    minus(v: Vector2D): Vector2D {
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
        return (x, y) => f(x, y).plus(g(x, y));
    }

    export function subtract(f: VectorField, g: VectorField) {
        return VectorField.add(f, multiply(g, -1));
    }

    export function multiply(f: VectorField, a: number) {
        return (x, y) => f(x, y).times(a);
    }
}

export interface VectorFieldParams {
    field: VectorField
    fieldLines?: [number, number][]
    fieldLineStepSize?: number
    fieldLineSteps?: number
}

export interface PlotterProps {
    /**
     * The parametric functions to plot
     */
    parametricFunctions?: ParametricFunctionParams[]

    /**
     * The vector fields to plot
     */
    vectorFields?: VectorFieldParams[]

    /**
     * The number of pixels which corresponds to one unit in plot coordinates
     */
    unit?: number

    /**
     * An array of points to plot
     */
    plotPoints?: [number, number][]

    /**
     * Called when the mouse is moved over the canvas
     */
    onMouseMove?: (x: number, y: number) => void
}

interface PlotterState {
    ctx: CanvasRenderingContext2D,
    cs: CoordinateSystem,
    parametricFunctions?: ParametricFunctionParams[]
    vectorFields?: VectorFieldParams[]
}

/**
 * A component which uses a canvas to plot functions and vectors
 */
export class Plotter extends React.Component<PlotterProps, PlotterState> {

    static readonly WIDTH = 600;
    static readonly HEIGHT = 460;

    static readonly DEFAULT_UNIT = 20;

    static readonly RES_FACTOR = 4;

    static readonly VECTOR_LENGTH = 10;

    static readonly FIELD_LINE_STEP_FACTOR = .1;
    static readonly FIELD_LINE_STEPS = 100;

    static readonly CANVAS_STYLE = {
        border: "solid 1px gray",
        width: Plotter.WIDTH.toString() + "px",
        height: Plotter.HEIGHT.toString() + "px"
    };

    canvas = undefined;
    canvasRef: HTMLCanvasElement = undefined;

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
        this.canvasRef.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.setState({ ctx: ctx }, () => {
            ctx.scale(Plotter.RES_FACTOR, Plotter.RES_FACTOR);
            this.draw();
        });
    }

    componentDidUpdate() {
        this.draw();
    }

    componentWillReceiveProps(nextProps: PlotterProps) {
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
        const cs = this.state.cs;

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
                    this.drawVectorField(f.field);
                    f.fieldLines.forEach((coords) => {
                        const x = coords[0];
                        const y = coords[1];
                        this.drawBidirectionalFieldLine(f.field, x, y, f.fieldLineStepSize || Plotter.FIELD_LINE_STEP_FACTOR, f.fieldLineSteps || Plotter.FIELD_LINE_STEPS);
                    });
                }
            });
        }

        ctx.save();
        ctx.fillStyle = '#555555';

        if (this.props.plotPoints) {
            this.props.plotPoints.forEach(coords => {
                const x = coords[0];
                const y = coords[1];
                ctx.beginPath();
                ctx.arc(cs.x(x), cs.y(y), 4, 0, 2 * math.pi);
                ctx.fill();
            });
        }

        ctx.restore();
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
        //const length = Plotter.VECTOR_LENGTH * math.log10(v.magnitude() + 1) * 2;
        const length = Plotter.VECTOR_LENGTH;
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
    drawVectorField(f: VectorField) {
        const ctx = this.state.ctx;
        const cs = this.state.cs;

        const startX = cs.invX(0);
        const startY = cs.invY(Plotter.HEIGHT);

        const endX = cs.invX(Plotter.WIDTH);
        const endY = cs.invY(0);

        const step = Plotter.VECTOR_LENGTH * 1.5 / cs.unit;

        for (let x = startX; x <= endX; x = x + step) {
            for (let y = startY; y <= endY; y = y + step) {
                this.drawVector(f(x, y), x, y);
            }
        }
    }

    /**
     * Draw a flow line of a vector field from a starting point
     * @param f the vector field
     * @param startX the starting x of the line
     * @param startY the starting y of the line
     * @param stepFactor the amount by which to multiply the added vectors
     * @param steps the number of steps to take
     */
    drawFieldLine(f: VectorField, startX: number, startY: number, stepFactor: number, steps: number) {
        let g = (x, y) => {
            return f(x, y).unitVector();
        }
        //g = f;
        const ctx = this.state.ctx;
        const cs = this.state.cs;

        ctx.beginPath();
        ctx.moveTo(cs.x(startX), cs.y(startY));

        let x = startX;
        let y = startY;

        for (let stepsElapsed = 0; stepsElapsed < steps; stepsElapsed++) {
            const newX = x + g(x, y).x * stepFactor;
            const newY = y + g(x, y).y * stepFactor;

            x = newX;
            y = newY;

            ctx.lineTo(cs.x(x), cs.y(y));
        }

        ctx.stroke();
    }

    /**
     * Draw a flow line of a vector field in both directions from a starting point
     * @param f the vector field
     * @param startX the starting x of the line
     * @param startY the starting y of the line
     * @param stepFactor the amount by which to multiply the added vectors
     * @param steps the number of steps to take
     */
    drawBidirectionalFieldLine(f: VectorField, startX: number, startY: number, stepFactor: number, steps: number) {
        this.drawFieldLine(f, startX, startY, stepFactor, steps);
        this.drawFieldLine(VectorField.multiply(f, -1), startX, startY, stepFactor, steps);
    }

    /**
     * Handle when the cursor is moved over the canvas
     * @param event 
     */
    handleMouseMove(event: MouseEvent) {
        const rect = this.canvasRef.getBoundingClientRect();
        const cs = this.state.cs;

        if (this.props.onMouseMove) {
            this.props.onMouseMove(cs.invX(event.clientX - rect.left), cs.invY(event.clientY - rect.top));
        }
    }
}
