import React from 'react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { SideNav } from "@/components/side-nav"

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-background">
            <div className="lg:hidden absolute top-2 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SideNav />
                    </SheetContent>
                </Sheet>
            </div>
            <div className="lg:block hidden">
                <SideNav />
            </div>
            {children}
        </div>
    )
}

export default SidebarLayout