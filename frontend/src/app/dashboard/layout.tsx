import {Fragment, ReactNode} from "react";
import {Footer} from "@/app/_ui/commun/footer";
import {DashboardHeader} from "@/app/_ui/commun/dashboard-header";


export default function DashboardLayout({children}: { children: ReactNode }){
    return (
        <div className="min-h-screen bg-muted/30">
            <DashboardHeader/>
            <Fragment>{children}</Fragment>

            <Footer/>
        </div>
    )
}