import { useCallback, useState } from 'react';
import { DrawingState, Point } from '@/types';

export const useDraw = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const [drawingState, setDrawingState] = useState<DrawingState>({
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
    });

    const getCoordinates = (event: MouseEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    };

    const drawCircle = (
        ctx: CanvasRenderingContext2D,
        start: Point,
        current: Point
    ) => {
        // Clear the canvas for preview
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Calculate radius using distance formula
        const radius = Math.sqrt(
            Math.pow(current.x - start.x, 2) + Math.pow(current.y - start.y, 2)
        );

        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const startDrawing = useCallback((e: React.MouseEvent) => {
        const point = getCoordinates(e.nativeEvent);
        setDrawingState({
            isDrawing: true,
            startPoint: point,
            currentPoint: point,
        });
    }, []);

    const draw = useCallback(
        (e: React.MouseEvent) => {
            if (!drawingState.isDrawing || !drawingState.startPoint) return;

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx || !canvas) return;

            const currentPoint = getCoordinates(e.nativeEvent);
            setDrawingState(prev => ({ ...prev, currentPoint }));

            drawCircle(ctx, drawingState.startPoint, currentPoint);
        },
        [drawingState.isDrawing, drawingState.startPoint]
    );

    const stopDrawing = useCallback(() => {
        setDrawingState({
            isDrawing: false,
            startPoint: null,
            currentPoint: null,
        });
    }, []);

    return {
        startDrawing,
        draw,
        stopDrawing,
    };
};