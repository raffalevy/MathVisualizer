/**
 * Represents a 2d parametric function
 */
export class ParametricFunction {
    x: (number) => number;
    y: (number) => number;

    constructor(xFunc: (number) => number, yFunc: (number) => number) {
        this.x = xFunc;
        this.y = yFunc;
    };
}

/**
 * Parameters representing how a parametric function is to be drawn
 */
export interface ParametricFunctionParams {
    p: ParametricFunction,
    pStart: number,
    pEnd: number,
    pStep: number
}