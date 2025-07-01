import * as React from "react"
import { cn } from "@/lib/utils"

// TABLE WRAPPER
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full">
    <table
      ref={ref}
      className={cn("w-full table-auto caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

// HEADER SECTION
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b-2 [&_tr]:border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

// BODY SECTION
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

// FOOTER SECTION
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

// TABLE ROW
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-100 transition-colors hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

// TABLE HEADER CELL
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-4 py-3 text-left align-middle font-semibold text-slate-700 whitespace-nowrap overflow-visible",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

// TABLE BODY CELL
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3 align-middle text-slate-700 whitespace-nowrap overflow-visible",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

// CAPTION
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
