"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Edit, Trash, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Role = "employee" | "admin" | "manager";

export type User = {
  user_id: string;
  profile_image: string | null;
  email: string;
  name: string;
  rfid_code: string;
  role: Role[];
  created_at: Date;
  updated_at: Date;
};

const generateUserId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateRandomUsersData = (num: number): User[] => {
  const users = [] as User[];
  const roles: Role[] = ["employee", "admin", "manager"];
  for (let i = 0; i < num; i++) {
    const numRoles = Math.floor(Math.random() * roles.length) + 1;
    const userRoles: Role[] = [];

    for (let j = 0; j < numRoles; j++) {
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      if (!userRoles.includes(randomRole)) {
        userRoles.push(randomRole);
      }
    }

    const user: User = {
      user_id: generateUserId(),
      profile_image: Math.random() > 0.5 ? `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${i % 99}.jpg` : null,
      email: `user${i}@example.com`,
      name: `User ${i}`,
      rfid_code: Math.floor(Math.random() * 1000000000).toString().padStart(10, '0'),
      role: userRoles,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      updated_at: new Date()
    };
    users.push(user);
  }
  return users;
};


const initialData: User[] = generateRandomUsersData(100);

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedUser: User) => void;
}

function EditUserDialog({ user, isOpen, onOpenChange, onSave }: EditUserDialogProps) {
  const [editedUser, setEditedUser] = React.useState<User | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
      setSelectedImage(null);
      setPreview(user.profile_image || null);

    } else {
      setEditedUser(null);
      setSelectedImage(null);
      setPreview(null);
    }
  }, [user, isOpen]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [name]: value,
      });
    }
  };

  const handleRoleChange = (value: Role[]) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        role: value,
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = (event.target.files as FileList)[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setPreview(editedUser?.profile_image || null);
    }
  };

  const handleSaveClick = () => {
    if (editedUser) {
      const updatedUser = {
        ...editedUser,
        profile_image: preview,
      };
      onSave(updatedUser);
      onOpenChange(false);
    }
  };

  if (!user || !editedUser) return null;

  const roles: Role[] = ["employee", "admin", "manager"];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Make changes to the user details here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="user_id" className="text-right">
              User ID
            </Label>
            <Input id="user_id" name="user_id" value={editedUser.user_id} className="col-span-3" disabled />
          </div>

          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="profile_image" className="text-right">
              Profile Image
            </Label>
            <div className="flex items-center col-span-3 space-x-4">
              <Button variant="outline" asChild>
                <Label htmlFor="profile_image_upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Upload</span>
                </Label>
              </Button>
              <Input
                type="file"
                id="profile_image_upload"
                name="profile_image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {preview && (
                <img src={preview} alt="Profile Preview" className="w-16 h-16 rounded-full" />
              )}
            </div>
          </div>

          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={editedUser.email}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="rfid_code" className="text-right">
              RFID Code
            </Label>
            <Input
              id="rfid_code"
              name="rfid_code"
              value={editedUser.rfid_code}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <div className="col-span-3">
              {roles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={editedUser.role.includes(role)}
                    onCheckedChange={(checked) => {
                      const newRoles = checked
                        ? [...editedUser.role, role]
                        : editedUser.role.filter((r) => r !== role);
                      handleRoleChange(newRoles);
                    }}
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
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveClick}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmationDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function DeleteConfirmationDialog({ user, isOpen, onOpenChange, onConfirm }: DeleteConfirmationDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user record for{" "}
            <span className="font-medium">{user.email}</span> (User ID: {user.user_id}).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UserTable() {
  const [data, setData] = React.useState<User[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState<User | null>(null);

  const handleEdit = (user: User) => {
    setCurrentRow(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setCurrentRow(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = (updatedUser: User) => {
    setData((prevData) =>
      prevData.map((row) => (row.user_id === updatedUser.user_id ? updatedUser : row))
    );
    setCurrentRow(null);
  };

  const handleConfirmDelete = () => {
    if (currentRow) {
      setData((prevData) => prevData.filter((row) => row.user_id !== currentRow.user_id));
    }
    setCurrentRow(null);
  };

  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "user_id",
        header: "User ID",
      },
      {
        accessorKey: "profile_image",
        header: "Profile Image",
        cell: ({ row }) => (row.getValue("profile_image") ? (
          <img src={row.getValue("profile_image")} alt={row.original.name} className="w-8 h-8 rounded-full" />
        ) : <div>No Image</div>),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Email <ArrowUpDown className="w-4 h-4 ml-2" />
          </Button>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name <ArrowUpDown className="w-4 h-4 ml-2" />
          </Button>
        ),
      },
      {
        accessorKey: "rfid_code",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            RFID Code <ArrowUpDown className="w-4 h-4 ml-2" />
          </Button>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Role <ArrowUpDown className="w-4 h-4 ml-2" />
          </Button>
        ),
        cell: ({ row }) => {
          const roles = row.getValue("role") as string[];
          return <div className="capitalize">{roles.join(", ")}</div>;
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Created At <ArrowUpDown className="w-4 h-4 ml-2" />
          </Button>
        ),
        cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
        sortingFn: (rowA, rowB, columnId) => {
          const dateA = rowA.original.created_at.getTime();
          const dateB = rowB.original.created_at.getTime();
          return dateA - dateB;
        },
      },
      {
        accessorKey: "updated_at",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Updated At <ArrowUpDown className="w-4 h-4 ml-2" />
          </Button>
        ),
        cell: ({ row }) => new Date(row.getValue("updated_at")).toLocaleDateString(),
        sortingFn: (rowA, rowB, columnId) => {
          const dateA = rowA.original.updated_at.getTime();
          const dateB = rowB.original.updated_at.getTime();
          return dateA - dateB;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.user_id)}>
                  Copy User ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(user)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  onClick={() => handleDelete(user)}
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleEdit, handleDelete]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="mx-8 overflow-x-hidden">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex justify-center py-4">
        <div className="rounded-md border bg-[#21366c0d] border-input w-max ">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-end py-4 space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      <EditUserDialog
        user={currentRow}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveEdit}
      />
      <DeleteConfirmationDialog
        user={currentRow}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}