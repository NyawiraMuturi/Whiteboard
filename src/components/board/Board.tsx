"use client"
import type React from "react"
import { useRef, useEffect, useState } from "react"
import type { Point, Move } from "@/types"
import { useShape } from "@/lib/context/ShapeContext"

const Board: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { selectedShape, drawingMode, moves, setMoves, addMove } = useShape()
    const [isDrawing, setIsDrawing] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [draggedMoveIndex, setDraggedMoveIndex] = useState<number>(-1)
    const [startPoint, setStartPoint] = useState<Point | null>(null)
    const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
    const [currentPath, setCurrentPath] = useState<Point[]>([])

    useEffect(() => {
        const handleResize = () => {
            setCanvasSize({
                width: window.innerWidth - 64,
                height: window.innerHeight,
            })
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawMoves(ctx, moves)

        // Draw current shape preview
        if (isDrawing && startPoint && currentPoint && drawingMode === "shape") {
            drawShapePreview(ctx, startPoint, currentPoint)
        }
    }, [moves, isDrawing, startPoint, currentPoint, drawingMode, selectedShape])

    const drawShapePreview = (ctx: CanvasRenderingContext2D, start: Point, current: Point) => {
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = "rgba(0, 0, 0, 1)"
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"

        switch (selectedShape) {
            case "line":
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(current.x, current.y)
                ctx.stroke()
                break
            case "arrow":
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(current.x, current.y)
                ctx.stroke()
                drawArrowhead(ctx, [start, current])
                break
            case "circle":
                const radius = Math.hypot(current.x - start.x, current.y - start.y)
                ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
                ctx.fill()
                ctx.stroke()
                break
            case "rect":
                ctx.rect(start.x, start.y, current.x - start.x, current.y - start.y)
                ctx.fill()
                ctx.stroke()
                break
            case "triangle":
                const thirdPoint = {
                    x: start.x - (current.x - start.x),
                    y: current.y,
                }
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(current.x, current.y)
                ctx.lineTo(thirdPoint.x, thirdPoint.y)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                break
        }
    }

    const findMoveAtPoint = (point: Point): number => {
        // Reverse loop to check most recently drawn shapes first
        for (let i = moves.length - 1; i >= 0; i--) {
            const move = moves[i]
            if (isPointInMove(point, move)) {
                return i
            }
        }
        return -1
    }

    const isPointInMove = (point: Point, move: Move): boolean => {
        const [start] = move.points
        const end = move.points[move.points.length - 1]

        switch (move.type) {
            case "rect":
                return (
                    point.x >= Math.min(start.x, end.x) &&
                    point.x <= Math.max(start.x, end.x) &&
                    point.y >= Math.min(start.y, end.y) &&
                    point.y <= Math.max(start.y, end.y)
                )
            case "circle": {
                const radius = Math.hypot(end.x - start.x, end.y - start.y)
                const distance = Math.hypot(point.x - start.x, point.y - start.y)
                return distance <= radius
            }
            case "triangle": {
                const [p1, p2, p3] = move.points
                return isPointInTriangle(point, p1, p2, p3)
            }
            case "line":
            case "arrow": {
                const tolerance = 5 // pixels
                const distance = distanceToLine(point, start, end)
                return distance <= tolerance
            }
            case "freehand": {
                // Check if point is near any segment of the freehand path
                const tolerance = 5
                for (let i = 1; i < move.points.length; i++) {
                    const distance = distanceToLine(point, move.points[i - 1], move.points[i])
                    if (distance <= tolerance) return true
                }
                return false
            }
            default:
                return false
        }
    }

    const isPointInTriangle = (p: Point, p1: Point, p2: Point, p3: Point): boolean => {
        const area = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2
        const area1 = Math.abs((p1.x - p.x) * (p2.y - p.y) - (p2.x - p.x) * (p1.y - p.y)) / 2
        const area2 = Math.abs((p2.x - p.x) * (p3.y - p.y) - (p3.x - p.x) * (p2.y - p.y)) / 2
        const area3 = Math.abs((p3.x - p.x) * (p1.y - p.y) - (p1.x - p.x) * (p3.y - p.y)) / 2
        return Math.abs(area - (area1 + area2 + area3)) < 0.1
    }

    const distanceToLine = (p: Point, start: Point, end: Point): number => {
        const numerator = Math.abs((end.y - start.y) * p.x - (end.x - start.x) * p.y + end.x * start.y - end.y * start.x)
        const denominator = Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2))
        return numerator / denominator
    }
    const drawMoves = (ctx: CanvasRenderingContext2D, movesToDraw: Move[]) => {
        movesToDraw.forEach((move) => {
            ctx.beginPath()
            ctx.lineWidth = move.options.lineWidth
            ctx.strokeStyle = rgbaToString(move.options.lineColor)
            ctx.fillStyle = rgbaToString(move.options.fillColor)

            ctx.globalCompositeOperation = "source-over"
            if (move.type === "erase") {
                ctx.globalCompositeOperation = "destination-out"
                ctx.strokeStyle = "rgba(255,255,255,1)" // Use white for eraser
            }

            switch (move.type) {
                case "line":
                case "arrow":
                case "freehand":
                case "erase":
                    ctx.moveTo(move.points[0].x, move.points[0].y)
                    move.points.forEach((point) => ctx.lineTo(point.x, point.y))
                    ctx.stroke()
                    if (move.type === "arrow") drawArrowhead(ctx, move.points)
                    break
                case "circle":
                    const [center, edge] = move.points
                    const radius = Math.hypot(center.x - edge.x, center.y - edge.y)
                    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.stroke()
                    break
                case "rect":
                    const [start, end] = move.points
                    ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y)
                    ctx.fill()
                    ctx.stroke()
                    break
                case "triangle":
                    ctx.moveTo(move.points[0].x, move.points[0].y)
                    ctx.lineTo(move.points[1].x, move.points[1].y)
                    ctx.lineTo(move.points[2].x, move.points[2].y)
                    ctx.closePath()
                    ctx.fill()
                    ctx.stroke()
                    break
            }
        })
    }

    const drawArrowhead = (ctx: CanvasRenderingContext2D, points: Point[]) => {
        const end = points[points.length - 1]
        const pre = points[points.length - 2]
        const angle = Math.atan2(end.y - pre.y, end.x - pre.x)
        const headlen = 10
        ctx.moveTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(end.x, end.y)
        ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const point = getCanvasPoint(e)
        const moveIndex = findMoveAtPoint(point)

        if (moveIndex !== -1 && drawingMode !== "erase") {
            setIsDragging(true)
            setDraggedMoveIndex(moveIndex)
            setCurrentPoint(point)
        } else {
            setIsDrawing(true)
            setStartPoint(point)
            setCurrentPoint(point)

            if (drawingMode === "freehand" || drawingMode === "erase") {
                setCurrentPath([point])
            }
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const newPoint = getCanvasPoint(e)

        if (isDragging && draggedMoveIndex !== -1 && currentPoint) {
            const move = moves[draggedMoveIndex]
            const dx = newPoint.x - currentPoint.x
            const dy = newPoint.y - currentPoint.y

            // Update move points
            const updatedPoints = move.points.map(p => ({
                x: p.x + dx,
                y: p.y + dy
            }))

            const updatedMove = {
                ...move,
                points: updatedPoints
            }

            // Update moves array
            const newMoves = [...moves]
            newMoves[draggedMoveIndex] = updatedMove
            setCurrentPoint(newPoint)
            setMoves(newMoves)
        } else if (isDrawing) {
            setCurrentPoint(newPoint)

            if (drawingMode === "freehand" || drawingMode === "erase") {
                setCurrentPath(prev => [...prev, newPoint])
                const canvas = canvasRef.current
                if (!canvas) return
                const ctx = canvas.getContext("2d")
                if (!ctx) return

                ctx.beginPath()
                ctx.lineWidth = drawingMode === "erase" ? 20 : 2
                ctx.globalCompositeOperation = "source-over"
                if (drawingMode === "erase") {
                    ctx.globalCompositeOperation = "destination-out"
                    ctx.strokeStyle = "rgba(255,255,255,1)"
                } else {
                    ctx.strokeStyle = "black"
                }
                ctx.moveTo(currentPoint!.x, currentPoint!.y)
                ctx.lineTo(newPoint.x, newPoint.y)
                ctx.stroke()
            }
        }
    }

    const handleMouseUp = () => {
        if (isDrawing && startPoint && currentPoint) {
            let newMove: Move
            if (drawingMode === "shape") {
                newMove = {
                    id: Date.now().toString(),
                    type: selectedShape,
                    points:
                        selectedShape === "triangle"
                            ? [
                                startPoint,
                                currentPoint,
                                {
                                    x: startPoint.x - (currentPoint.x - startPoint.x),
                                    y: currentPoint.y,
                                },
                            ]
                            : [startPoint, currentPoint],
                    options: {
                        lineWidth: 2,
                        lineColor: { r: 0, g: 0, b: 0, a: 1 },
                        fillColor: { r: 255, g: 255, b: 255, a: 0.5 },
                        shape: selectedShape,
                        mode: drawingMode,
                        size: 5,
                    },
                }
                addMove(newMove)
            } else if ((drawingMode === "freehand" || drawingMode === "erase") && currentPath.length > 1) {
                newMove = {
                    id: Date.now().toString(),
                    type: drawingMode === "erase" ? "erase" : "freehand",
                    points: currentPath,
                    options: {
                        lineWidth: drawingMode === "erase" ? 20 : 2,
                        lineColor: { r: 0, g: 0, b: 0, a: 1 },
                        fillColor: { r: 0, g: 0, b: 0, a: 1 },
                        shape: "freehand",
                        mode: drawingMode,
                        size: 5,
                    },
                }
                addMove(newMove)
            }
        }

        setIsDrawing(false)
        setIsDragging(false)
        setDraggedMoveIndex(-1)
        setStartPoint(null)
        setCurrentPoint(null)
        setCurrentPath([])
    }

    const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }

    const rgbaToString = (color: { r: number; g: number; b: number; a: number }): string => {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    }

    return (
        <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border border-gray-300"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    )
}

export default Board

