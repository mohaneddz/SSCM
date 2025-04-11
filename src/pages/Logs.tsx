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
  Row, // Import Row type
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Edit, Trash } from "lucide-react" // Import Edit and Trash icons

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
  DialogTrigger, // We might trigger programmatically
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


// Define the Event type (same as before)
export type EventType = "security" | "anomaly" | "event";

export type Event = {
  id: string;
  type: EventType;
  timeAndDate: Date;
  event: string;
};

const generateEventId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// generate number of events with a function 
const generateEvents = (num: number): Event[] => {
    const events: Event[] = [];
    for (let i = 0; i < num; i++) {
        events.push({
            id: generateEventId(),
            type: ["security", "anomaly", "event"][Math.floor(Math.random() * 3)] as EventType,
            timeAndDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random date within the last 10 days
            event: `Event ${i + 1}`,
        });
    }
    return events;
};

const initialData: Event[] = generateEvents(100); // Generate 100 events for initial data



// --- Edit Dialog Component ---
interface EditEventDialogProps {
  event: Event | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: Event) => void;
}

function EditEventDialog({ event, isOpen, onOpenChange, onSave }: EditEventDialogProps) {
  const [editedEvent, setEditedEvent] = React.useState<Event | null>(null);

  // Update internal state when the event prop changes (when a new row is selected for editing)
  React.useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
    } else {
        setEditedEvent(null); // Reset if dialog is closed or no event
    }
  }, [event, isOpen]); // Depend on isOpen to reset when closed

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (editedEvent) {
      setEditedEvent({
        ...editedEvent,
        [name]: value,
      });
    }
  };

    const handleTypeChange = (value: EventType) => {
     if (editedEvent) {
      setEditedEvent({
        ...editedEvent,
        type: value,
      });
    }
  }

    const handleTimeAndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (editedEvent) {
            const newDate = new Date(event.target.value);
            setEditedEvent({
                ...editedEvent,
                timeAndDate: newDate,
            });
        }
    };

  const handleSaveClick = () => {
    if (editedEvent) {
      onSave(editedEvent);
      onOpenChange(false); // Close dialog after save
    }
  };

  if (!event || !editedEvent) return null; // Don't render if no event data

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Make changes to the event details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID
            </Label>
            <Input id="id" name="id" value={editedEvent.id} className="col-span-3" disabled />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
             <Select name="type" value={editedEvent.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="anomaly">Anomaly</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center align-baseline gap-4 text-center">
                <Label htmlFor="timeAndDate" className="text-right">
                    Time and Date
                </Label>
                <Input
                    id="timeAndDate"
                    name="timeAndDate"
                    type="datetime-local"
                    value={editedEvent.timeAndDate ? editedEvent.timeAndDate.toISOString().slice(0, 16) : ""}
                    onChange={handleTimeAndDateChange}
                    className="col-span-3"
                />
            </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event" className="text-right">
              Event
            </Label>
            <Input
              id="event"
              name="event"
              value={editedEvent.event}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

        </div>
        <DialogFooter>
           <DialogClose asChild>
             <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveClick}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- Delete Confirmation Dialog Component ---
interface DeleteConfirmationDialogProps {
  event: Event | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function DeleteConfirmationDialog({ event, isOpen, onOpenChange, onConfirm }: DeleteConfirmationDialogProps) {
    if (!event) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the event
                        record for <span className="font-medium">{event.event}</span> (ID: {event.id}).
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


// --- Main Table Component ---
export default function Logs() {
  const [data, setData] = React.useState<Event[]>(initialData); // Manage data with state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // State for modals
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState<Event | null>(null);

  // --- Action Handlers ---
  const handleEdit = (event: Event) => {
    setCurrentRow(event);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (event: Event) => {
    setCurrentRow(event);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = (updatedEvent: Event) => {
        setData(prevData =>
            prevData.map(row => {
                if (row.id === updatedEvent.id) {
                    return {
                        ...row,
                        type: updatedEvent.type,
                        timeAndDate: updatedEvent.timeAndDate,
                        event: updatedEvent.event
                    };
                }
                return row;
            })
        );
        setCurrentRow(null); // Reset current row
    };

  const handleConfirmDelete = () => {
    if (currentRow) {
      setData(prevData => prevData.filter(row => row.id !== currentRow.id));
    }
     setCurrentRow(null); // Reset current row
  };


  // --- Define Columns within the component to access handlers ---
   const columns: ColumnDef<Event>[] = React.useMemo(() => [
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("type")}</div>
        ),
      },
      {
        accessorKey: "timeAndDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Time and Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("timeAndDate"));
          return <div>{date.toLocaleString()}</div>; // Format the date as needed
        },
      },
      {
        accessorKey: "event",
        header: () => <div className="text-left">Event</div>,
        cell: ({ row }) => {
          return <div className="text-left font-medium">{row.getValue("event")}</div>
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const event = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(event.id)}
                >
                  Copy event ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Edit Action */}
                <DropdownMenuItem onClick={() => handleEdit(event)}>
                   <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                {/* Delete Action */}
                 <DropdownMenuItem
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                    onClick={() => handleDelete(event)}
                 >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
                {/* Add back other items if needed */}
                {/* <DropdownMenuItem>View customer</DropdownMenuItem>
                <DropdownMenuItem>View event details</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ], [handleEdit, handleDelete]); // Add dependencies if needed, though handlers defined above should be stable if not recreated unnecessarily

  // --- React Table Instance ---
  const table = useReactTable({
    data, // Use state variable here
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
    // Provide meta data if needed by columns (like our action handlers)
    // meta: {
    //   editRow: handleEdit,
    //   deleteRow: handleDelete,
    // } // Alternative way to pass handlers if columns are defined outside
  });

  // --- Render Component ---
  return (
    <div className="mx-8 ">
      {/* Filter and Column Visibility (same as before) */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter events..."
          value={(table.getColumn("event")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("event")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Rendering (same as before) */}
      <div className="rounded-md border border-input bg-[#21366c0d]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and Row Selection Info (same as before) */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Render the Modals */}
      <EditEventDialog
        event={currentRow}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveEdit}
      />
      <DeleteConfirmationDialog
        event={currentRow}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}