import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Plotter } from './Plotter';
import { CoordinateSystem } from './CoordinateSystem';
import * as math from 'mathjs';

const START = -3;
const END = 3;
const STEP = .0005;
const PREC = 100000;

class HeatEquationPlotter extends React.Component<{}, {
    f0: (x: number) => number
    points: object
}> {

    constructor(props) {
        super(props);

        const f0 = x => 2 * math.exp(-4 * x ** 2);
        const points = {};

        for (let a = START * PREC; a < END * PREC; a += STEP * PREC) {
            points[a] = f0(a / PREC);
        }

        this.state = {
            f0,
            points
        };
    }

    render() {
        return (<div><Plotter unit={60} drawingCallbacks={[this.draw.bind(this)]} />
        <br/> {JSON.stringify(this.state.points,undefined,2)}</div>)
    }

    componentDidMount() {
        window.setInterval(() => {
            const newPoints = {};
            for (let a = START * PREC; a < END * PREC; a += STEP * PREC) {
                newPoints[a] = this.point(a / PREC) + this.laplacian(a / PREC) * .001;
            }
            this.setState({ points: newPoints });
        }, 100);
    }

    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem) {
        ctx.beginPath();

        ctx.moveTo(cs.x(START), cs.y(this.state.points[START]));

        for (let a = START; a < END; a += STEP) {
            ctx.lineTo(cs.x(a), cs.y(this.point(a)));
        }
        ctx.stroke();
    }

    laplacian(x: number): number {
        const points = this.state.points;

        const dX = STEP;

        const ddx1 = (this.point(x + dX) - this.point(x)) / dX;
        const ddx2 = (this.point(x + 2 * dX) - this.point(x + dX)) / dX

        return (ddx2 - ddx1) / dX;
    }

    point(x: number): number {
        return this.state.points[Math.round(x * PREC)];
    }
}

ReactDOM.render(<HeatEquationPlotter />, document.getElementById('root'));