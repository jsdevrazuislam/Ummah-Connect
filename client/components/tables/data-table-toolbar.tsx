"use client";

import type { Table } from "@tanstack/react-table";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchKey: string;
};

export function DataTableToolbar<TData>({
  table,
  searchKey,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={event =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <Button variant="destructive" size="sm" className="h-8">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      )}
    </div>
  );
}
