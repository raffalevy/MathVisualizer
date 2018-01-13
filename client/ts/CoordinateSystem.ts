import {Plotter} from './Plotter';

/**
 * Used to transform between plot coordinates and screen coordinates
 */
export class CoordinateSystem {
    
        /**
         * The X coordinate of the origin
         */
        readonly originX: number;
    
        /**
         * The Y coordinate of the origin
         */
        readonly originY: number;
    
        /**
         * The number of pixels which cooresponds to one unit on the plot
         */
        readonly unit: number;
    
        constructor(originX: number, originY: number, unit: number) {
            this.originX = originX;
            this.originY = originY;
            this.unit = unit;
        }
    
        /**
         * Transform plot X to screen X
         * @param inX 
         */
        x(inX: number): number {
            return this.unit * inX + this.originX;
        }
    
        /**
         * Transform plot Y to screen Y
         * @param inY 
         */
        y(inY: number): number {
            return Plotter.HEIGHT - (this.unit * inY + this.originY);
        }
    
        /**
         * Transform screen X to plot X
         * @param inX 
         */
        invX(inX: number): number {
            return (inX - this.originX) / this.unit;
        }
    
        /**
         * Transform screen Y to plot Y
         * @param inY 
         */
        invY(inY: number) {
            return (Plotter.HEIGHT - inY - this.originY) / this.unit;
        }
    
        /**
         * Return an identical coordinate system to this one using a different unit
         * @param newUnit
         */
        withUnit(newUnit): CoordinateSystem {
            return new CoordinateSystem(this.originX, this.originY, newUnit);
        }
    
    }