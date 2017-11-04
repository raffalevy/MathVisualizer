import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Plotter, ParametricFunction, ParametricFunctionParams} from "./Plotter";
import {ParametricFunctionConfig} from "./ParametricFunctionConfig";
import * as math from 'mathjs';

interface ParametricFunctionAppState {
    f: ParametricFunctionParams
    unit: number
}

export class ParametricFunctionApp extends React.Component<{}, ParametricFunctionAppState> {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            f: {
                p: new ParametricFunction((t) => math.cos(7*t), (t) => math.sin(11*t)),
                pStart: 0,
                pEnd: 2 * 3.1415,
                pStep: 0.001
            },
            unit: 20
        }
    }

    render() {
        return (
            <div>
                <div>
                    <ParametricFunctionConfig onFunctionChange={this.handleFunctionChange.bind(this)} onZoomChange={this.handleZoomChange.bind(this)}/>
                </div>
                <div>
                    <Plotter parametricFunctions={[this.state.f]} unit={this.state.unit}/>
                </div>
            </div>
        );
    }

    handleFunctionChange(f: ParametricFunctionParams) {
        this.setState({f});
    }

    handleZoomChange(zoom: number) {
        this.setState({unit: zoom*zoom * 40*40});
    }
}