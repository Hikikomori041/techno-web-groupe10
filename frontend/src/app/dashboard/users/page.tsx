"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Pencil, Trash2, Users, Mail, Shield, Package} from "lucide-react"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {usersService} from "@/lib/api/services/users.service";
import {User} from '@/lib/api/definitions';
import {Checkbox} from "@/components/ui/checkbox";
import {useRouter} from "next/navigation";
import {authService} from "@/lib/api/services/auth.service";
import {toast} from "sonner";


export default function UserManagementPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([])
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);


    const fetchUsers = async () => {
        try {
            const check = await authService.isAuthenticated();

            if (!check.authenticated || !check.user) {
                router.push('/login');
                return;
            }

            const result = await usersService.getAllUsers()
            setUsers(result)
        } catch (error: unknown) {
            console.error("Error fetching users:", error)
        }
    }

    useEffect(() => {
        const loadUsers = async () => {
            await fetchUsers()
        }

        loadUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleEditRoles = (user: User) => {
        setEditingUser(user);
        setSelectedRoles([...user.roles]);
        setIsEditDialogOpen(true)
    };

    const toggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user)
        setIsDeleteDialogOpen(true)
    }

    const handleUpdateRoles = async () => {
        if (!editingUser) return;

        try {
            await usersService.updateUserRole(editingUser._id, selectedRoles);
            await fetchUsers();
            setEditingUser(null);
            toast.success('Roles updated successfully!');
            setIsEditDialogOpen(false);
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message || 'Failed to update roles');
        } finally {
            setIsEditDialogOpen(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await usersService.deleteUser(userId);
            await fetchUsers();
            toast.info('User deleted successfully!');
            setIsDeleteDialogOpen(false);
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message || 'Failed to delete user');
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return {label: "Admin", variant: "default" as const, icon: Shield}
            case "moderator":
                return {label: "Moderator", variant: "secondary" as const, icon: Shield}
            default:
                return {label: "Customer", variant: "outline" as const, icon: Users}
        }
    }

    const getProviderBadge = (provider: string) => {
        switch (provider) {
            case "local":
                return {label: "Local", variant: "default" as const}
            case "google":
                return {label: "Google", variant: "secondary" as const}
            default:
                return {label: provider, variant: "outline" as const}
        }
    }

    const getInitials = (firstName: string | null, lastName: string | null) => {
        if (firstName && lastName) {
            return firstName.toUpperCase().charAt(0) + lastName.toUpperCase().charAt(0)
        } else {
            return "US"
        }
    }


    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
                    <p className="text-muted-foreground">Manage user accounts and permissions</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>Users Overview</CardTitle>
                                <CardDescription>View, edit, and manage all users</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2"/>
                                        <p className="text-muted-foreground">No Users found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Roles</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>{
                                        users.map((user) => {
                                            const providerBadge = getProviderBadge(user.provider)
                                            return (
                                                <TableRow key={user._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage
                                                                    src={user.picture || "/placeholder.svg"}
                                                                    alt={`${user.firstName} ${user.lastName}`}
                                                                />
                                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                                    {getInitials(user.firstName, user.lastName)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {user.firstName} {user.lastName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground"/>
                                                            <span className="text-sm">{user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.roles.map((role) => {
                                                            return <Badge key={role}
                                                                          variant={getRoleBadge(role).variant}>{role}</Badge>
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={providerBadge.variant}>{providerBadge.label}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm"
                                                                    onClick={() => handleEditRoles(user)}>
                                                                <Pencil className="h-4 w-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(user)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    }
                                    </TableBody>
                                </Table>
                            )}

                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user information and permissions</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    {['user', 'moderator', 'admin'].map((role) => (
                                        <div key={role} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={role}
                                                checked={selectedRoles.includes(role)}
                                                onCheckedChange={() => toggleRole(role)}
                                            />
                                            <Label htmlFor={role} className="capitalize">
                                                {role}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateRoles} className="bg-primary hover:bg-primary/90">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete User</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This
                                action cannot
                                be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setSelectedUser(null)
                            }}>
                                Cancel
                            </Button>
                            <Button variant="destructive"
                                    onClick={() => selectedUser && handleDeleteUser(selectedUser._id)}>
                                Delete User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
