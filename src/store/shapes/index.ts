import { create } from 'zustand'
import { Shape } from '@/types'

interface DrawingStore {
    selectedShape: Shape;
    setSelectedShape: (shape: Shape) => void;
}

export const useDrawingStore = create<DrawingStore>((set) => ({
    selectedShape: 'circle',
    setSelectedShape: (shape) => set({ selectedShape: shape })
}))