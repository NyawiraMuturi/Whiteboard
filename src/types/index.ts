import { RgbaColor } from 'react-colorful'

export interface Point {
    x: number;
    y: number;
}


export interface CtxOptions {
    lineWidth: number;
    lineColor: RgbaColor;
    fillColor: RgbaColor;
    shape: Shape;
    mode: DrawingMode;
    size: number;
}

export type Shape = 'line' | 'circle' | 'rect' | 'image' | 'triangle' | 'arrow' | 'freehand';
export type CtxMode = 'eraser' | 'draw' | 'select';
export type DrawingMode = "shape" | "freehand" | "erase"

export interface DrawingState {
    isDrawing: boolean;
    startPoint: Point | null;
    currentPoint: Point | null;
}

export interface Move {
    id: string
    type: Shape | "erase"
    points: Point[]
    options: CtxOptions
}