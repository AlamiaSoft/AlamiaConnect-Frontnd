"use strict";

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

interface ResponsiveDialogProps {
    children: React.ReactNode
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    title: string
    description?: string
    trigger?: React.ReactNode
}

export function ResponsiveDialog({
    children,
    isOpen,
    setIsOpen,
    title,
    description,
    trigger,
}: ResponsiveDialogProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && <DrawerDescription>{description}</DrawerDescription>}
                </DrawerHeader>
                <div className="px-4 pb-4 overflow-y-auto max-h-[80vh]">
                    {children}
                </div>
                <DrawerFooter className="pt-2">
                    {/* Footer content if needed, usually buttons are in the form itself */}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
