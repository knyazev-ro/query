import { CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

const FTable = ({ columns, data, total, loading, page, perPage, onPageChange, onRowsPerPageChange, title, additionl }) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Paper sx={{ width: '100%', height: '100%', overflow: 'hidden', p: 2 }}>
            <div className="mb-2 flex items-center justify-between">
                {title && <h2 className="text-lg font-bold text-gray-300">{title.toUpperCase()}</h2>}
                {additionl !== undefined ? additionl() : null}
            </div>

            <TableContainer>
                <Table size="small">
                    {' '}
                    {/* компактная таблица */}
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell
                                        key={header.id}
                                        sx={{ py: 0.5, px: 1, fontWeight: 'bold', backgroundColor: '#7700ff', color: 'white', fontSize: '0.75rem' }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 2 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} hover>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} sx={{ py: 0.5, px: 1, fontSize: '0.85rem' }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
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
                sx={{ mt: 1 }}
            />
        </Paper>
    );
};

export default FTable;
