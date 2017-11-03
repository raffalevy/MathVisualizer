import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Plotter, ParametricFunction, ParametricFunctionParams} from "./Plotter";
import {ParametricFunctionConfig} from "./ParametricFunctionConfig";

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
                <div>
                    <ParametricFunctionConfig onFunctionChange={this.handleFunctionChange.bind(this)}/>
                </div>
                <div>
                    <Plotter parametricFunctions={[this.state.f]}/>
                </div>
            </div>
        );
    }

    handleFunctionChange(f: ParametricFunctionParams) {
        this.setState({f});
    }
}