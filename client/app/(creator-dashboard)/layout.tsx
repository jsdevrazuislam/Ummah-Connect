import { SocialDashboard } from "@/components/layouts/dashboard-layout";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex relative w-full">
                <div className="relative z-50">
                    <SocialDashboard />
                </div>
                <main className="flex-1 pl-4 overflow-auto md:pl-[240px] pr-4 py-4 bg-background">
                    <div className=" md:hidden">
                        <SidebarTrigger>
                            <div className="sr-only"></div>
                        </SidebarTrigger>
                    </div>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
