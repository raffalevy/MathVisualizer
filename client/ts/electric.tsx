import * as ReactDOM from 'react-dom';
import * as React from 'react';

import {PFZoomInput} from "./ParametricFunctionConfig";

import {Plotter, Vector2D, VectorField} from './Plotter';

/**
 * Base app component
 */
class VectorFieldApp extends React.Component<{}, { zoom: number, unit: number, fieldType: string }> {

    /**
     * Returns the electric field created by a point charge at the given coordinates (electric constant ignored)
     * @param {number} q The charge
     * @param {number} xA
     * @param {number} yA
     */
    static chargeField(q: number, xA: number, yA: number) : VectorField {
        return (x, y) => {
            const v = new Vector2D(x - xA, y - yA);
            const vReduced = v.transform(z => z * q / v.magnitude() ** 2);
            return vReduced;
        }
    }

    static readonly fieldTypes = {
        // single: (x, y) => {
        //     const v = new Vector2D(x, y);
        //     const vReduced = v.transform(z => z / v.magnitude() ** 2);
        //     return vReduced;
        // },
        single: VectorFieldApp.chargeField(1, 0, 0),
        dipole: VectorField.subtract(VectorFieldApp.chargeField(1, -1, 0), VectorFieldApp.chargeField(1, 1, 0)),
        double: VectorField.add(VectorFieldApp.chargeField(1, -1, 0), VectorFieldApp.chargeField(1, 1, 0)),
        imbalancedDipole: VectorField.subtract(VectorFieldApp.chargeField(2, -1, 0), VectorFieldApp.chargeField(1, 1, 0))
    };


    constructor(props) {
        super(props);
        this.state = {
            zoom: 0.224,
            unit: 80,
            fieldType: "single"
        }
    }

    render() {
        return (<div>
            <div><Plotter
                vectorFields={[VectorFieldApp.fieldTypes[this.state.fieldType] || VectorFieldApp.fieldTypes.single]}
                unit={this.state.unit}/></div>
            <div>
                <PFZoomInput label="Zoom: " value={this.state.zoom} onValueChange={this.handleZoomChange.bind(this)}/>
                <br/><label>Field: <select value={this.state.fieldType}
                                           onChange={this.handleFieldTypeChange.bind(this)}>
                <option value="single">Single Charge</option>
                <option value="dipole">Dipole</option>
                <option value="double">Double Charge</option>
                <option value="imbalancedDipole">Imbalanced Dipole</option>
            </select></label>
            </div>
        </div>);
    }

    handleZoomChange(zoom: number) {
        this.setState({unit: zoom * zoom * 40 * 40});
    }

    handleFieldTypeChange(event) {
        this.setState({fieldType: event.target.value});
    }
}

// Render the base component in the root div
ReactDOM.render(<VectorFieldApp/>, document.getElementById('root'));

