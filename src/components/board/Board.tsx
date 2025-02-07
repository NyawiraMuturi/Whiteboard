'use client'
import React, { useRef } from 'react';
import { useDraw } from '@/hooks/useDraw';

const Board = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { startDrawing, draw, stopDrawing } = useDraw(canvasRef);

    return (
        <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg bg-white"
            width={1200}
            height={800}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
        />
    );
};

export default Board;
