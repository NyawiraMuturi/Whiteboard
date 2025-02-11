'use client'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"

import { Eraser, Palette, Undo2, Redo2, Shapes, Pencil, Square, Circle, Triangle, Minus, MoveUpRight, ImageUp } from "lucide-react"
import { useShape } from "@/lib/context/ShapeContext"


const SideNav = () => {
    const { setSelectedShape } = useShape()
    return (
        <Menubar className="flex flex-col w-16 h-full py-4 space-y-4">
            <MenubarMenu>
                <MenubarTrigger><Shapes /></MenubarTrigger>
                <MenubarContent className="grid grid-cols-3 gap-2">
                    <MenubarItem onClick={() => setSelectedShape("rect")}>
                        <Square />
                    </MenubarItem>
                    <MenubarItem onClick={() => setSelectedShape("circle")}>
                        <Circle />
                    </MenubarItem>
                    <MenubarItem onClick={() => setSelectedShape("triangle")}>
                        <Triangle />
                    </MenubarItem>
                    <MenubarItem onClick={() => setSelectedShape("line")}>
                        <Minus />
                    </MenubarItem>
                    <MenubarItem onClick={() => setSelectedShape("arrow")}>
                        <MoveUpRight />
                    </MenubarItem>
                    <MenubarSeparator />
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger><Pencil /></MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger><Eraser /></MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger><Palette /></MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger><ImageUp /></MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger><Undo2 /></MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger><Redo2 /></MenubarTrigger>
            </MenubarMenu>
        </Menubar>

    )
}

export default SideNav
