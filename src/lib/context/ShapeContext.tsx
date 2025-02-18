"use client"

import type React from "react"
import { createContext, useState, useContext, useCallback } from "react"
import type { Shape, DrawingMode, Move } from "@/types"

type ShapeContextType = {
    selectedShape: Shape
    setSelectedShape: (shape: Shape) => void
    drawingMode: DrawingMode
    setDrawingMode: (mode: DrawingMode) => void
    moves: Move[]
    setMoves: React.Dispatch<React.SetStateAction<Move[]>>
    addMove: (move: Move) => void
    undo: () => void
    redo: () => void
}

const ShapeContext = createContext<ShapeContextType | undefined>(undefined)

export const ShapeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedShape, setSelectedShape] = useState<Shape>("line")
    const [drawingMode, setDrawingMode] = useState<DrawingMode>("shape")
    const [moves, setMoves] = useState<Move[]>([])
    const [undoneMovesStack, setUndoneMovesStack] = useState<Move[]>([])

    const addMove = useCallback((move: Move) => {
        setMoves((prevMoves) => [...prevMoves, move])
        setUndoneMovesStack([])
    }, [])

    const undo = useCallback(() => {
        if (moves.length > 0) {
            const lastMove = moves[moves.length - 1]
            setMoves((prevMoves) => prevMoves.slice(0, -1))
            setUndoneMovesStack((prevStack) => [...prevStack, lastMove])
        }
    }, [moves])

    const redo = useCallback(() => {
        if (undoneMovesStack.length > 0) {
            const moveToRedo = undoneMovesStack[undoneMovesStack.length - 1]
            setUndoneMovesStack((prevStack) => prevStack.slice(0, -1))
            setMoves((prevMoves) => [...prevMoves, moveToRedo])
        }
    }, [undoneMovesStack])

    return (
        <ShapeContext.Provider
            value={{
                selectedShape,
                setSelectedShape,
                drawingMode,
                setDrawingMode,
                moves,
                setMoves,
                addMove,
                undo,
                redo
            }}
        >
            {children}
        </ShapeContext.Provider>
    )
}

export const useShape = () => {
    const context = useContext(ShapeContext)
    if (context === undefined) {
        throw new Error("useShape must be used within a ShapeProvider")
    }
    return context
}

