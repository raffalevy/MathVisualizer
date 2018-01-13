import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SecondOrderDifferentialEquationPlotter } from './DifferentialEquationPlotter';

function parseFloatSafe(s: string) {
    const parsed = parseFloat(s);
    if (isNaN(parsed)) {
        return 0;
    } else {
        return parsed;
    }
}

class DiffApp extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            yFactor: -1,
            yPrimeFactor: 0,
            y0: 1,
            yPrime0: 0
        }
    }

    render() {
        const { yFactor, yPrimeFactor, y0, yPrime0 } = this.state;

        return (<div>
            <h1>Differential Equation Solver Demo</h1>

            <h2>y'' = -y <br />
                y(0) = <DiffInput value={y0} onInput={this.handleY0.bind(this)} /> <br />
                y'(0) = 0 </h2>
            <SecondOrderDifferentialEquationPlotter
                yPrimePrime={(y, yPrime) => -y} yInit={y0} yPrimeInit={0} />

        </div>);
    }

    handleY0(value: string) {
        this.setState({ y0: value });
    }
}

class DiffInput extends React.Component<{ value: string, onInput: (value: string) => void }> {
    render() {
        return <input type='text' value={this.props.value} onChange={this.handleInput.bind(this)} />;
    }

    handleInput(e) {
        this.props.onInput(e.target.value);
    }
}

ReactDOM.render(<DiffApp />, document.getElementById('root'));