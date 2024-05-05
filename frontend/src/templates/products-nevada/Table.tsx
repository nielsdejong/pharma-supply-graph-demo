import React from 'react';
import {
    DataGrid,
    StatusIndicator,
    Tip,
} from '@neo4j-ndl/react';
import { InformationCircleIconOutline } from '@neo4j-ndl/react/icons';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';


import './style.css';

type Row = {
    product: string;
    quantity: number;
    customer: string;
};

const columnHelper = createColumnHelper<Row>();

const columns = [
    columnHelper.accessor('product', {
        header: () => <b>product</b>,
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
    }),
    columnHelper.accessor('quantity', {
        header: () => <b>quantity</b>,
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
    }),
    columnHelper.accessor('customer', {
        header: () => <b>customer</b>,
        cell: (info) => <i>{info.getValue()}</i>,
        footer: (info) => info.column.id,
    }),

];

export default function MyTable(props: any) {
    if (props.data.length == 0) {
        return <p>No data</p>
    }

    const network = props.data;
    const defaultData: Row[] = network as Row[];
    const tableData = defaultData;
    const table = useReactTable({
        data: tableData,
        columns,
        enableSorting: true,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        renderFallbackValue: null,
    });



    return <DataGrid<Row>
        isResizable={false}
        tableInstance={table}
        isKeyboardNavigable={false}
        styling={{
            zebraStriping: true,
            borderStyle: 'none',
            headerStyle: 'filled',
        }}
        components={{
            Navigation: null,
        }}
    />
}