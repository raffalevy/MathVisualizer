import * as React from "react";

import {Plotter, PlotterProps} from './Plotter';
import {CoordinateSystem} from './CoordinateSystem';

const Dx = .05;
const STEPS = 1000;

export interface SecondOrderDifferentialEquationPlotterProps extends PlotterProps {
    yPrimePrime: (y: number, yPrime: number) => number
    yInit: number
    yPrimeInit: number
}

export class SecondOrderDifferentialEquationPlotter extends React.Component<SecondOrderDifferentialEquationPlotterProps> {

    constructor(props) {
        super(props);
    }

    render() {
        const {yPrimePrime, yInit, yPrimeInit, ...other} = this.props;
        return <Plotter {...other} drawingCallbacks={[this.draw.bind(this)]} />
    }

    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem) {
        const {yPrimePrime, yInit, yPrimeInit} = this.props;

        let x = 0;
        let y = yInit;
        let yPrime = yPrimeInit;

        ctx.beginPath();
        ctx.moveTo(cs.x(x), cs.y(y));

        for (let i = 0; i < STEPS; i++) {
            yPrime = yPrime + yPrimePrime(y, yPrime)*Dx;
            y = y + yPrime * Dx;

            x = x + Dx;

            ctx.lineTo(cs.x(x), cs.y(y));
            
        }

        ctx.stroke();

        x = 0;
        y = yInit;
        yPrime = yPrimeInit;

        ctx.beginPath();
        ctx.moveTo(cs.x(x), cs.y(y));

        for (let i = 0; i < STEPS; i++) {
            yPrime = yPrime - yPrimePrime(y, yPrime)*Dx;
            y = y - yPrime * Dx;

            x = x - Dx;

            ctx.lineTo(cs.x(x), cs.y(y));
            
        }

        ctx.stroke();
    }
}