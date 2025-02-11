"use client"
import type React from "react"
import { useRef, useEffect, useState } from "react"
import type { Point, Move } from "@/types"
import { useShape } from "@/lib/context/ShapeContext"

const Board: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { selectedShape, drawingMode, moves, addMove } = useShape()
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentPath, setCurrentPath] = useState<Point[]>([])
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const handleResize = () => {
            setCanvasSize({
                width: window.innerWidth - 64, // Subtracting SideNav width
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
    }, [moves]) // Removed canvasSize from dependencies

    const drawMoves = (ctx: CanvasRenderingContext2D, movesToDraw: Move[]) => {
        movesToDraw.forEach((move) => {
            ctx.beginPath()
            ctx.lineWidth = move.options.lineWidth
            ctx.strokeStyle = rgbaToString(move.options.lineColor)
            ctx.fillStyle = rgbaToString(move.options.fillColor)

            if (move.type === "erase") {
                ctx.globalCompositeOperation = "destination-out"
            } else {
                ctx.globalCompositeOperation = "source-over"
            }

            switch (move.type) {
                case "line":
                case "arrow":
                case "freehand":
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
        setIsDrawing(true)
        const point = getCanvasPoint(e)
        setCurrentPath([point])
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return
        const newPoint = getCanvasPoint(e)
        setCurrentPath((prev) => [...prev, newPoint])

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.beginPath()
        ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y)
        ctx.lineTo(newPoint.x, newPoint.y)
        ctx.stroke()
    }

    const handleMouseUp = () => {
        setIsDrawing(false)
        if (currentPath.length < 2) return

        let newMove: Move
        if (drawingMode === "shape") {
            newMove = {
                id: Date.now().toString(),
                type: selectedShape,
                points:
                    selectedShape === "triangle"
                        ? [
                            currentPath[0],
                            currentPath[currentPath.length - 1],
                            {
                                x: currentPath[0].x - (currentPath[currentPath.length - 1].x - currentPath[0].x),
                                y: currentPath[currentPath.length - 1].y,
                            },
                        ]
                        : [currentPath[0], currentPath[currentPath.length - 1]],
                options: {
                    lineWidth: 2,
                    lineColor: { r: 0, g: 0, b: 0, a: 1 },
                    fillColor: { r: 255, g: 255, b: 255, a: 0.5 },
                    shape: selectedShape,
                    mode: drawingMode,
                    size: 5,
                },
            }
        } else {
            newMove = {
                id: Date.now().toString(),
                type: drawingMode === "erase" ? "erase" : "freehand",
                points: currentPath,
                options: {
                    lineWidth: drawingMode === "erase" ? 20 : 2,
                    lineColor: drawingMode === "erase" ? { r: 255, g: 255, b: 255, a: 1 } : { r: 0, g: 0, b: 0, a: 1 },
                    fillColor: { r: 0, g: 0, b: 0, a: 1 },
                    shape: "freehand",
                    mode: drawingMode,
                    size: 5,
                },
            }
        }
        addMove(newMove)
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

