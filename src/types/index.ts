export interface Point {
    x: number;
    y: number;
}

export interface DrawOptions {
    color: string;
    size: number;
}

export interface CtxOptions extends DrawOptions {
    shape: Shape;
    mode: CtxMode;
}

export type Shape = 'line' | 'circle' | 'rect' | 'image' | 'triangle';
export type CtxMode = 'eraser' | 'draw' | 'select';

export interface DrawingState {
    isDrawing: boolean;
    startPoint: Point | null;
    currentPoint: Point | null;
}