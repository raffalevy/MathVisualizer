import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Plotter, ParametricFunction, ParametricFunctionParams} from "./Plotter";

interface ParametricFunctionAppState {
    f: ParametricFunctionParams
}

export class ParametricFunctionApp extends React.Component<{}, ParametricFunctionAppState> {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            f: {
                p: new ParametricFunction((t) => t * t, (t) => 2 * t),
                pStart: -3,
                pEnd: 3,
                pStep: 0.1
            }
        }
    }

    render() {
        return (
            <div>
                <p>
                    <button onClick={this.handleButtonClick.bind(this)}>Click this!</button>
                </p>
                <p>
                    <Plotter parametricFunctions={[this.state.f]}/>
                </p>
            </div>
        );
    }

    handleButtonClick() {
        this.setState({f: {
            p: new ParametricFunction((t) => t * t, (t) => 3 * t),
            pStart: -3,
            pEnd: 3,
            pStep: 0.1
        }});
    }
}