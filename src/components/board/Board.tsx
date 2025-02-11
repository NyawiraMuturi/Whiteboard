"use client"
import React, { useRef, useEffect, useState } from "react"
import { useDrawing } from "@/hooks/useDrawing"
import type { Point, Move } from "@/types"
import { RgbaColor } from "react-colorful"
import { useShape } from "@/lib/context/ShapeContext"

const Board: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { selectedShape } = useShape()
    const { isDrawing, startPoint, endPoint, options, moves, startDrawing, draw, endDrawing, setShape } = useDrawing()
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        setShape(selectedShape)
    }, [selectedShape, setShape])

    useEffect(() => {
        const handleResize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        // Set initial size
        handleResize()

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Remove event listener on cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw all previous moves
        moves.forEach((move) => {
            drawShape(ctx, move)
        })

        // Draw the current shape if drawing
        if (isDrawing && startPoint && endPoint) {
            drawCurrentShape(ctx)
        }
    }, [isDrawing, startPoint, endPoint, moves])

    const drawShape = (ctx: CanvasRenderingContext2D, move: Move) => {
        const { options, circle, rect, path } = move
        ctx.beginPath()
        ctx.lineWidth = options.lineWidth
        ctx.strokeStyle = rgbaToString(options.lineColor)
        ctx.fillStyle = rgbaToString(options.fillColor)

        switch (options.shape) {
            case "circle":
                ctx.ellipse(circle.cX, circle.cY, circle.radiusX, circle.radiusY, 0, 0, 2 * Math.PI)
                break
            case "rect":
                ctx.rect(path[0][0], path[0][1], rect.width, rect.height)
                break
            case "triangle":
                ctx.moveTo(path[0][0], path[0][1])
                ctx.lineTo(path[1][0], path[1][1])
                ctx.lineTo(path[0][0] - (path[1][0] - path[0][0]), path[1][1])
                ctx.closePath()
                break
            case "line":
                ctx.moveTo(path[0][0], path[0][1])
                ctx.lineTo(path[1][0], path[1][1])
                break
            case "arrow":
                drawArrow(ctx, path[0][0], path[0][1], path[1][0], path[1][1])
                break
        }

        ctx.stroke()
        if (options.shape !== "line" && options.shape !== "arrow") {
            ctx.fill()
        }
    }

    const drawCurrentShape = (ctx: CanvasRenderingContext2D) => {
        if (!startPoint || !endPoint) return

        ctx.beginPath()
        ctx.lineWidth = options.lineWidth
        ctx.strokeStyle = rgbaToString(options.lineColor)
        ctx.fillStyle = rgbaToString(options.fillColor)

        switch (options.shape) {
            case "circle":
                const radiusX = Math.abs(endPoint.x - startPoint.x) / 2
                const radiusY = Math.abs(endPoint.y - startPoint.y) / 2
                const centerX = (startPoint.x + endPoint.x) / 2
                const centerY = (startPoint.y + endPoint.y) / 2
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
                break
            case "rect":
                ctx.rect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y)
                break
            case "triangle":
                ctx.moveTo(startPoint.x, startPoint.y)
                ctx.lineTo(endPoint.x, endPoint.y)
                ctx.lineTo(startPoint.x - (endPoint.x - startPoint.x), endPoint.y)
                ctx.closePath()
                break
            case "line":
                ctx.moveTo(startPoint.x, startPoint.y)
                ctx.lineTo(endPoint.x, endPoint.y)
                break
            case "arrow":
                drawArrow(ctx, startPoint.x, startPoint.y, endPoint.x, endPoint.y)
                break
        }

        ctx.stroke()
        if (options.shape !== "line" && options.shape !== "arrow") {
            ctx.fill()
        }
    }

    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
        const headLength = 10 // length of head in pixels
        const dx = toX - fromX
        const dy = toY - fromY
        const angle = Math.atan2(dy, dx)

        // Draw the main line
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)

        // Draw the arrow head
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(toX, toY)
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6))
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const point: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
        startDrawing(point)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const point: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
        draw(point)
    }

    const handleMouseUp = () => {
        endDrawing()
    }

    const rgbaToString = (color: RgbaColor): string => {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    }

    return (
        <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    )
}

export default Board
