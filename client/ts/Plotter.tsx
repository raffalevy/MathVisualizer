import * as React from "react";
import { ReactElement, ReactHTMLElement } from "react";

import * as math from 'mathjs';

import {Vector2D, VectorField, VectorFieldParams} from './VectorField';
import {ParametricFunction, ParametricFunctionParams} from './ParametricFunction';
import {CoordinateSystem} from './CoordinateSystem';

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

    /**
     * A list of custom drawing callbacks
     */
    drawingCallbacks?: ((ctx: CanvasRenderingContext2D, cs: CoordinateSystem) => void)[];
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
            cs: this.state.cs.withUnit(nextProps.unit || this.state.cs.unit)
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

        if (this.props.drawingCallbacks) {
            this.props.drawingCallbacks.forEach(cb => {
                cb(ctx, cs);
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
