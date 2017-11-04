import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ParametricFunctionParams, ParametricFunction} from './Plotter'
import * as math from 'mathjs';

interface PFConfigProps {
    onFunctionChange: (f: ParametricFunctionParams) => void
    onZoomChange: (zoom: number) => void
}

interface PFConfigState {
    xValue: string
    yValue: string
    startValue: string
    endValue: string
    stepValue: string
    zoom: number
}

export class ParametricFunctionConfig extends React.Component<PFConfigProps, PFConfigState> {

    fChanged = false;
    zoomChanged = false;

    constructor(props) {
        super(props);
        this.state = {
            xValue: 'cos(7t)',
            yValue: 'sin(11t)',
            startValue: '0',
            endValue: '2pi',
            stepValue: '0.001',
            zoom: 0.112
        }
    }

    render() {
        return <div>
            <p>
                <PFConfigField label="x(t) = " value={this.state.xValue}
                               onValueChange={this.handleXValueChange.bind(this)}/>
            </p>
            <p>
                <PFConfigField label="y(t) = " value={this.state.yValue}
                               onValueChange={this.handleYValueChange.bind(this)}/>
            </p>
            <p>
                <PFConfigField label="From " value={this.state.startValue}
                               onValueChange={this.handleStartValueChange.bind(this)}/>
                <PFConfigField label="To " value={this.state.endValue}
                               onValueChange={this.handleEndValueChange.bind(this)}/>
            </p>
            <p>
                <PFConfigField label="Step Size: " value={this.state.stepValue}
                               onValueChange={this.handleStepValueChange.bind(this)}/>
            </p>
            <p>
                <PFZoomInput label="Zoom: " value={this.state.zoom} onValueChange={this.handleZoomChange.bind(this)}/>
            </p>
        </div>
    }

    handleXValueChange(xValue) {
        this.fChanged = true;
        this.setState({xValue});
    }

    handleYValueChange(yValue) {
        this.fChanged = true;
        this.setState({yValue});
    }

    handleStartValueChange(startValue) {
        this.fChanged = true;
        this.setState({startValue});
    }

    handleEndValueChange(endValue) {
        this.fChanged = true;
        this.setState({endValue});
    }

    handleStepValueChange(stepValue) {
        this.fChanged = true;
        this.setState({stepValue});
        //, this.updateFunction.bind(this)
    }

    handleZoomChange(zoom) {
        this.zoomChanged = true;
        this.setState({zoom});
    }

    componentDidUpdate() {
        this.updateFunction();
    }

    updateFunction() {
        let xExpr = undefined;
        let yExpr = undefined;

        let pStart = undefined;
        let pEnd = undefined;
        let pStep = undefined;

        if (this.zoomChanged) {
            this.zoomChanged = false;
            this.props.onZoomChange(this.state.zoom)
        }

        try {
            xExpr = math.compile(this.state.xValue);
            yExpr = math.compile(this.state.yValue);

            pStart = math.eval(this.state.startValue);
            pEnd = math.eval(this.state.endValue);
            pStep = math.eval(this.state.stepValue);

            if (xExpr && yExpr && pStart != undefined && pEnd != undefined && pStep != undefined) {
                const newFunc = {
                    p: new ParametricFunction(t => {
                        try {
                            return xExpr.eval({t})
                        } catch (e) {
                            console.log(e);
                        }
                    }, t => {
                        try {
                            return yExpr.eval({t})
                        } catch (e) {
                            console.log(e);
                        }
                    }),
                    pStart,
                    pEnd,
                    pStep
                };

                if (this.fChanged) {
                    this.fChanged = false;
                    this.props.onFunctionChange(newFunc);
                }
            } else {
                if (this.fChanged) {
                    this.fChanged = false;
                    this.props.onFunctionChange(null);
                }
            }

        } catch (e) {
            if (this.fChanged) {
                this.fChanged = false;
                this.props.onFunctionChange(null);
            }
        }

    }

}

interface PFConfigFieldProps {
    label: string
    value: string
    onValueChange: (string) => void
}

class PFConfigField extends React.Component<PFConfigFieldProps> {

    constructor(props) {
        super(props);
    }

    render() {
        return (<label>{this.props.label} <input type="text" onInput={this.handleChange.bind(this)}
                                                 defaultValue={this.props.value}/></label>);
    }

    handleChange(e: Event) {
        this.props.onValueChange((e.target as any).value);
    }
}

interface PFZoomInputProps {
    label: string
    value: number
    onValueChange: (string) => void
}

class PFZoomInput extends React.Component<PFZoomInputProps> {

    constructor(props: PFZoomInputProps) {
        super(props);
    }

    render() {
        return (<label>{this.props.label}
            <input type="range" min="0" max="1" defaultValue={this.props.value.toString()} onChange={this.handleChange.bind(this)} step="0.01"/>
        </label>);
    }

    handleChange(e: Event) {
        this.props.onValueChange((e.target as any).value);
    }
}