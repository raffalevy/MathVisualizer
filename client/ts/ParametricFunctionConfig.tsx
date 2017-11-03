import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ParametricFunctionParams, ParametricFunction} from './Plotter'
import * as math from 'mathjs';

interface PFConfigProps {
    onFunctionChange: (f: ParametricFunctionParams) => void
}

interface PFConfigState {
    xValue: string
    yValue: string
    startValue: string
    endValue: string
    stepValue: string
}

export class ParametricFunctionConfig extends React.Component<PFConfigProps, PFConfigState> {

    fChanged = false;

    constructor(props) {
        super(props);
        this.state = {
            xValue: 't^2',
            yValue: '2t',
            startValue: '-3',
            endValue: '3',
            stepValue: '0.1'
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

    componentDidUpdate() {
        this.updateFunction();
    }

    updateFunction() {
        let xExpr = undefined;
        let yExpr = undefined;

        let pStart = undefined;
        let pEnd = undefined;
        let pStep = undefined;

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