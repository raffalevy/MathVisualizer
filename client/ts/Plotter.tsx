import * as React from "react";
import {ReactElement, ReactHTMLElement} from "react";

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

export interface PlotterProps {
    parametricFunctions?: ParametricFunctionParams[]
    unit?: number
}

interface PlotterState {
    ctx: CanvasRenderingContext2D,
    cs: CoordinateSystem,
    parametricFunctions?: ParametricFunctionParams[]
}

export class Plotter extends React.Component<PlotterProps, PlotterState> {

    static readonly WIDTH = 600;
    static readonly HEIGHT = 460;

    static readonly DEFAULT_UNIT = 20;

    static readonly RES_FACTOR = 4;

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
            parametricFunctions: props.parametricFunctions
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
}