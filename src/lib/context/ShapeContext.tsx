"use client"

import type React from "react"
import { createContext, useState, useContext } from "react"
import type { Shape } from "@/types"

type ShapeContextType = {
    selectedShape: Shape
    setSelectedShape: (shape: Shape) => void
}

const ShapeContext = createContext<ShapeContextType | undefined>(undefined)

export const ShapeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedShape, setSelectedShape] = useState<Shape>("line")

    return <ShapeContext.Provider value={{ selectedShape, setSelectedShape }}>{children}</ShapeContext.Provider>
}

export const useShape = () => {
    const context = useContext(ShapeContext)
    if (context === undefined) {
        throw new Error("useShape must be used within a ShapeProvider")
    }
    return context
}

