import {Card, CardContent} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CreditCard, LogOut, Package, User} from "lucide-react";
import type {User as UserType} from "@/lib/api/definitions";
import {Separator} from "@/components/ui/separator";
import {Fragment} from "react";
import {useRouter} from "next/navigation";


export function Sidenav({user, logout}: { user: UserType | null, logout: () => void }) {
    const {firstName, lastName, email, roles} = user || {};
    const router = useRouter();

    return <Fragment>
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User"/>
                        <AvatarFallback
                            className="bg-primary text-primary-foreground text-2xl">{firstName && lastName ? firstName.toUpperCase().charAt(0) + lastName.toUpperCase().charAt(0) : "US"}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{firstName + " " + lastName}</h2>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    <Badge className="mt-2" variant="secondary">
                        {roles?.includes("admin") ? "Admin" : roles?.includes("moderator") ? "Moderator" : "User"}
                    </Badge>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardContent className="p-2">
                <nav className="flex flex-col gap-1">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/profile")}
                        className="justify-start gap-2 cursor-pointer"
                    >
                        <User className="h-4 w-4"/>
                        Profile Info
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/profile/orders")}
                        className="justify-start gap-2 cursor-pointer"
                    >
                        <Package className="h-4 w-4"/>
                        Orders
                    </Button>
                    <Separator className="my-2"/>
                    <Button
                        variant="ghost"
                        onClick={logout}
                        className="justify-start gap-2 text-destructive hover:text-destructive cursor-pointer"
                    >
                        <LogOut className="h-4 w-4"/>
                        Logout
                    </Button>
                </nav>
            </CardContent>
        </Card>
    </Fragment>
}