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
    mode: CtxMode;
    size: number;
}

export type Shape = 'line' | 'circle' | 'rect' | 'image' | 'triangle' | 'arrow';
export type CtxMode = 'eraser' | 'draw' | 'select';

export interface DrawingState {
    isDrawing: boolean;
    startPoint: Point | null;
    currentPoint: Point | null;
}

export type Move = {
    circle: {
        cX: number;
        cY: number;
        radiusX: number;
        radiusY: number;
    };
    rect: {
        width: number;
        height: number;
    };
    img: {
        base64: string;
    };
    path: [number, number][];
    options: CtxOptions;
    timestamp: number;
    id: string;
}