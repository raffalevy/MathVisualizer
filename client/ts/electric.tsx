import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { PFZoomInput } from "./ParametricFunctionConfig";

import { Plotter, Vector2D, VectorField } from './Plotter';

import * as math from 'mathjs';

/**
 * Base app component for electric field demo
 */
class VectorFieldApp extends React.Component<{}, {
    zoom: number
    unit: number
    fieldType: string
    startX: number
    startY: number
    mouseX: number
    mouseY: number
    lengthFactor: number
}> {

    /**
     * Returns the electric field created by a point charge at the given coordinates (electric constant ignored)
     * @param {number} q The charge
     * @param {number} xA
     * @param {number} yA
     */
    static chargeField(q: number, xA: number, yA: number): VectorField {
        return (x, y) => {
            const v = new Vector2D(x - xA, y - yA);
            return v.transform(z => z * q / v.magnitude() ** 2);
        }
    }

    /**
     * Object containing the selectable field presets
     */
    static readonly fieldTypes = {
        /**
         * Field produced by a single positive point charge
         */
        single: VectorFieldApp.chargeField(1, 0, 0),

        /**
         * Field produced by a positive and negative point charge of equal magnitudes
         */
        dipole: VectorField.subtract(VectorFieldApp.chargeField(1, -1, 0), VectorFieldApp.chargeField(1, 1, 0)),

        /**
         * Field produced by two equal positive charges
         */
        double: VectorField.add(VectorFieldApp.chargeField(1, -1, 0), VectorFieldApp.chargeField(1, 1, 0)),

        /**
         * Field produced by a positive charge and a smaller negative charge
         */
        imbalancedDipole: VectorField.subtract(VectorFieldApp.chargeField(2, -1, 0), VectorFieldApp.chargeField(1, 1, 0))
    };

    constructor(props) {
        super(props);
        this.state = {
            zoom: 0.224,
            unit: 80,
            fieldType: "single",
            startX: .25,
            startY: .75,
            lengthFactor: .25,
            mouseX: 1,
            mouseY: 1
        }
    }

    render() {
        // const startX = (this.state.startX - .5) * 5;
        // const startY = (this.state.startY - .5) * 5;

        const mouseX = this.state.mouseX;
        const mouseY = this.state.mouseY;

        return (<div>
            <h1>Electric Field Plotter</h1>
            <div>
                <PFZoomInput label="Zoom: " value={this.state.zoom} onValueChange={this.handleZoomChange.bind(this)} />
                {/* <br /><PFZoomInput label="Field Line Start X: " value={this.state.startX} onValueChange={this.handleStartXChange.bind(this)} /> {startX.toFixed(2)} */}
                {/* <br /><PFZoomInput label="Field Line Start Y: " value={this.state.startY} onValueChange={this.handleStartYChange.bind(this)} /> {startY.toFixed(2)} */}
                <br /><PFZoomInput label="Field Line Length" value={this.state.lengthFactor} onValueChange={this.handleLengthChange.bind(this)} />
                <br /><label>Field: <select value={this.state.fieldType}
                    onChange={this.handleFieldTypeChange.bind(this)}>
                    <option value="single">Single Charge</option>
                    <option value="dipole">Dipole</option>
                    <option value="double">Double Charge</option>
                    <option value="imbalancedDipole">Imbalanced Dipole</option>
                </select></label>
            </div>
            <div><Plotter
                vectorFields={[{
                    field: VectorFieldApp.fieldTypes[this.state.fieldType] || VectorFieldApp.fieldTypes.single,
                    // fieldLines: [[startX, startY]],
                    fieldLines: [[mouseX,mouseY]],
                    fieldLineSteps: 100 + this.state.lengthFactor * 1000
                }]} plotPoints={[[mouseX, mouseY]]} unit={this.state.unit} onMouseMove={this.handleMouseMove.bind(this)}/></div>
        </div>);
    }

    /**
     * Handle changes to the zoom control
     * @param zoom Ranges from 0 to 1
     */
    handleZoomChange(zoom: number) {
        // Set the unit of the coordinate system
        this.setState({ unit: zoom * zoom * 40 * 40 });
    }

    // /**
    //  * Handle changes to the start X control
    //  * @param xFactor 0-1
    //  */
    // handleStartXChange(xFactor: string) {
    //     this.setState({ startX: parseFloat(xFactor) });
    // }

    // /**
    // * Handle changes to the start Y control
    // * @param yFactor 0-1
    // */
    // handleStartYChange(yFactor: string) {
    //     this.setState({ startY: parseFloat(yFactor) });
    // }

    handleLengthChange(lengthFactor: string) {
        this.setState({ lengthFactor: parseFloat(lengthFactor) });
    }

    /**
     * Handle changes to the field preset selector
     * @param event 
     */
    handleFieldTypeChange(event) {
        /**
         * Set the new field type
         */
        this.setState({ fieldType: event.target.value });
    }

    handleMouseMove(x: number, y: number) {
        this.setState({mouseX: x, mouseY: y});
    }
}

// Render the base component in the root div
ReactDOM.render(<VectorFieldApp />, document.getElementById('root'));

