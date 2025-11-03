import {
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from '@mui/material';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

const CompactTable = ({
    columns,
    data,
    total,
    loading,
    page,
    perPage,
    onPageChange,
    onRowsPerPageChange,
}) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Paper
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                boxShadow: 'none',
                backgroundColor: 'white',
            }}
        >
            {/* горизонтальная прокрутка включена */}
            <TableContainer sx={{ overflowX: 'auto' }}>
                {/* tableLayout: 'fixed' заставляет браузер следовать ширинам колонок */}
                <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const colWidth = header.column.columnDef.width || 'auto';

                                    return (
                                        <TableCell
                                            key={header.id}
                                            sx={{
                                                py: 0.75,
                                                px: 1,
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                borderBottom: '1px solid #e5e7eb',
                                                backgroundColor: '#f9fafb',
                                                color: '#374151',
                                                width: colWidth,
                                                minWidth: colWidth,
                                                maxWidth: colWidth,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 2 }}>
                                    <CircularProgress size={20} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel()?.rows?.map((row) => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    sx={{
                                        '&:hover': { backgroundColor: '#f3f4f6' },
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const colWidth = cell.column.columnDef.width || 'auto';

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                sx={{
                                                    py: 0.5,
                                                    px: 1,
                                                    fontSize: '0.8rem',
                                                    borderBottom: '1px solid #e5e7eb',
                                                    color: '#111827',
                                                    width: colWidth,
                                                    minWidth: colWidth,
                                                    maxWidth: colWidth,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    boxSizing: 'border-box',
                                                    textAlign: cell.column.columnDef.align || 'center',
                                                }}
                                            >
                                                {/* Если внутри ячейки сложная верстка (grid 2x2),
                                                    нужно позволить этому элементу растянуться по ширине */}
                                                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={perPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    '.MuiTablePagination-toolbar': {
                        minHeight: '40px',
                    },
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                        fontSize: '0.8rem',
                    },
                    '.MuiTablePagination-select': {
                        fontSize: '0.8rem',
                    },
                }}
            />
        </Paper>
    );
};

export default CompactTable;
