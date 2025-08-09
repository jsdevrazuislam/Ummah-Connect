import type { ColumnDef } from "@tanstack/react-table";

import { BarChart3, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ColumnActions = {
    onEdit: (shortId: number) => void;
    onDelete: (shortId: number) => void;
    onAnalytics: (shortId: number) => void;
};

export function getShortColumns({
    onEdit,
    onDelete,
    onAnalytics,
}: ColumnActions): ColumnDef<ShortsEntity>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={value => row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "video",
            header: "Video",
            cell: ({ row }) => (
                <div className="flex gap-2 w-80 overflow-hidden">
                    <Image src={row.original.thumbnailUrl} alt="Video" width={100} height={100} className="object-cover w-30 rounded-md h-16" />
                    <p className="line-clamp-1 flex-1">
                        {row.original.description}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "visibility",
            header: "Visibility",
            cell: ({ row }) => row.original.isPublic ? "Public" : "Private",
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            },
            sortingFn: (a, b) =>
                new Date(a.original.createdAt).getTime() - new Date(b.original.createdAt).getTime(),
        },
        {
            accessorKey: "views",
            header: "Views",
            cell: () => 0,
        },
        {
            accessorKey: "commentsCount",
            header: "Comments",
        },
        {
            accessorKey: "reactionsCount",
            header: "Likes",
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => onEdit(row.original.id)}
                        >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            <span>Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          onClick={() => onDelete(row.original.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => onAnalytics(row.original.id)}
                        >
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span>View Analytics</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}

export function getPostColumns({
    onEdit,
    onDelete,
    onAnalytics,
}: ColumnActions): ColumnDef<PostsEntity>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={value => row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "content",
            header: "Post",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate">{row.getValue("content")}</div>
            ),
        },
        {
            accessorKey: "privacy",
            header: "Visibility",
            cell: ({ row }) => <p className=" capitalize">{row.original.privacy}</p>,
        },
        {
            accessorKey: "contentType",
            header: "Type",
            cell: ({ row }) => <p className=" capitalize">{row.original.contentType}</p>,
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            },
            sortingFn: (a, b) =>
                new Date(a.original.createdAt ?? "").getTime() - new Date(b.original.createdAt ?? "").getTime(),
        },
        {
            accessorKey: "reactionsCount",
            header: "Reactions",
        },
        {
            accessorKey: "commentsCount",
            header: "Comments",
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => onEdit(row.original.id)}
                        >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            <span>Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          onClick={() => onDelete(row.original.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => onAnalytics(row.original.id)}
                        >
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span>View Analytics</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}

export function getLiveColumns(): ColumnDef<LiveStreamData>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={value => row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "title",
            header: "Live",
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${row.getValue("isActive") ? "bg-green-500" : "bg-gray-500"
                            }`}
                    />
                    {row.getValue("isActive") ? "Live" : "Ended"}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            },
            sortingFn: (a, b) =>
                new Date(a.original.createdAt).getTime() - new Date(b.original.createdAt).getTime(),
        },
        {
            id: "actions",
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Analytics</DropdownMenuItem>
                        <DropdownMenuItem>Download Recording</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}
