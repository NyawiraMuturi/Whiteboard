"use client"

import type React from "react"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"

import {
    Eraser,
    Palette,
    Undo2,
    Redo2,
    Shapes,
    Pencil,
    Square,
    Circle,
    Triangle,
    Minus,
    MoveUpRight,
    ImageUp,
} from "lucide-react"
import { useShape } from "@/lib/context/ShapeContext"

const SideNav: React.FC = () => {
    const { setSelectedShape, setDrawingMode, undo, redo } = useShape()

    return (
        <Menubar className="flex flex-col w-16 h-full py-4 space-y-4">
            <MenubarMenu>
                <MenubarTrigger>
                    <Shapes />
                </MenubarTrigger>
                <MenubarContent className="grid grid-cols-3 gap-2">
                    <MenubarItem
                        onClick={() => {
                            setSelectedShape("rect")
                            setDrawingMode("shape")
                        }}
                    >
                        <Square />
                    </MenubarItem>
                    <MenubarItem
                        onClick={() => {
                            setSelectedShape("circle")
                            setDrawingMode("shape")
                        }}
                    >
                        <Circle />
                    </MenubarItem>
                    <MenubarItem
                        onClick={() => {
                            setSelectedShape("triangle")
                            setDrawingMode("shape")
                        }}
                    >
                        <Triangle />
                    </MenubarItem>
                    <MenubarItem
                        onClick={() => {
                            setSelectedShape("line")
                            setDrawingMode("shape")
                        }}
                    >
                        <Minus />
                    </MenubarItem>
                    <MenubarItem
                        onClick={() => {
                            setSelectedShape("arrow")
                            setDrawingMode("shape")
                        }}
                    >
                        <MoveUpRight />
                    </MenubarItem>
                    <MenubarSeparator />
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger onClick={() => setDrawingMode("freehand")}>
                    <Pencil />
                </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger onClick={() => setDrawingMode("erase")}>
                    <Eraser />
                </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>
                    <Palette />
                </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>
                    <ImageUp />
                </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger onClick={undo}>
                    <Undo2 />
                </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger onClick={redo}>
                    <Redo2 />
                </MenubarTrigger>
            </MenubarMenu>
        </Menubar>
    )
}

export default SideNav

