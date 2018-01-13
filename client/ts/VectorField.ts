import * as math from 'mathjs';

/**
 * Represents a 2D vector
 */
export class Vector2D {
    readonly x: number;
    readonly y: number;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Get this vector's magnitude on the Euclidean plane
     */
    magnitude(): number {
        return math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * Apply a function to the components of this vector
     * @param f The transformation to apply to the X component. This will also be applied to the Y component if no second function is given.
     * @param g The transformation to apply to the Y component.
     */
    transform(f: (x: number) => number, g?: (y: number) => number): Vector2D {
        if (!g) {
            g = f;
        }

        return new Vector2D(f(this.x), g(this.y));
    }

    /**
     * Returns a vector pointing in the same direction as this one with a magnitude of 1.
     */
    unitVector(): Vector2D {
        return this.transform((x) => x / this.magnitude());
    }

    /**
     * Multiply this vector by a scalar
     * @param {number} a The scalar to multiply by
     */
    times(a: number): Vector2D {
        return this.transform(x => x * a);
    }

    /**
     * Add another vector to this one
     * @param {Vector2D} v The vector to add
     * @returns {Vector2D} The sum of the two vectors
     */
    plus(v: Vector2D): Vector2D {
        return this.transform(x => x + v.x, y => y + v.y);
    }

    /**
     * Subtract a vector from this one
     * @param v The vector to subtrace
     * @returns {Vector2D} The difference of the vectors
     */
    minus(v: Vector2D): Vector2D {
        return this.plus(v.times(-1));
    }
}

export interface VectorField {
    (x: number, y: number): Vector2D
}

/**
 * Functions for transforming vector fields
 */
export namespace VectorField {
    export function add(f: VectorField, g: VectorField) {
        return (x, y) => f(x, y).plus(g(x, y));
    }

    export function subtract(f: VectorField, g: VectorField) {
        return VectorField.add(f, multiply(g, -1));
    }

    export function multiply(f: VectorField, a: number) {
        return (x, y) => f(x, y).times(a);
    }
}

export interface VectorFieldParams {
    field: VectorField
    fieldLines?: [number, number][]
    fieldLineStepSize?: number
    fieldLineSteps?: number
}