import { useCallback, useState } from 'react';
import { Point, Shape, Move, CtxOptions } from '@/types';
import { v4 as uuidv4 } from "uuid"

const initialOptions: CtxOptions = {
    lineWidth: 2,
    lineColor: { r: 0, g: 0, b: 0, a: 1 },
    fillColor: { r: 255, g: 255, b: 255, a: 0 },
    shape: "line",
    mode: "draw",
    size: 5,
}


export const useDrawing = () => {
    const [isDrawing, setIsDrawing] = useState(false)
    const [startPoint, setStartPoint] = useState<Point | null>(null)
    const [endPoint, setEndPoint] = useState<Point | null>(null)
    const [options, setOptions] = useState<CtxOptions>(initialOptions)
    const [moves, setMoves] = useState<Move[]>([])

    const startDrawing = useCallback((point: Point) => {
        setIsDrawing(true)
        setStartPoint(point)
        setEndPoint(point)
    }, [])

    const draw = useCallback(
        (point: Point) => {
            if (isDrawing) {
                setEndPoint(point)
            }
        },
        [isDrawing],
    )

    const endDrawing = useCallback(() => {
        if (isDrawing && startPoint && endPoint) {
            const newMove: Move = {
                circle: {
                    cX: (startPoint.x + endPoint.x) / 2,
                    cY: (startPoint.y + endPoint.y) / 2,
                    radiusX: Math.abs(endPoint.x - startPoint.x) / 2,
                    radiusY: Math.abs(endPoint.y - startPoint.y) / 2,
                },
                rect: {
                    width: Math.abs(endPoint.x - startPoint.x),
                    height: Math.abs(endPoint.y - startPoint.y),
                },
                img: { base64: "" },
                path: [
                    [startPoint.x, startPoint.y],
                    [endPoint.x, endPoint.y],
                ],
                options,
                timestamp: Date.now(),
                id: uuidv4(),
            }
            setMoves((prevMoves) => [...prevMoves, newMove])
        }
        setIsDrawing(false)
        setStartPoint(null)
        setEndPoint(null)
    }, [isDrawing, startPoint, endPoint, options])

    const setShape = useCallback((shape: Shape) => {
        setOptions((prevOptions) => ({ ...prevOptions, shape }))
    }, [])

    return {
        isDrawing,
        startPoint,
        endPoint,
        options,
        moves,
        startDrawing,
        draw,
        endDrawing,
        setShape,
    }
}