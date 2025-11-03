import FTable from '@/components/FTable';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import CellAction from '@/components/table/CellAction';
import ColumnHeader from '@/components/table/ColumnHeader';
import { router } from '@inertiajs/react';

const Index = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const [sortAndFilter, setSortAndFilter] = useState({
        filters: [],
        sortBy: null,
        sortDir: 'asc',
    });

    const columns = useMemo(() => [
        {
            accessorKey: 'action',
            header: 'ДЕЙСТВИЯ',
            cell: (value) => <CellAction value={value} />,
        },
        { accessorKey: 'id', header: 'ID' },
        {
            accessorKey: 'name',
            header: (
                <ColumnHeader
                    title="НАЗВАНИЕ"
                    col="name"
                    sortAndFilter={sortAndFilter}
                    setSortAndFilter={setSortAndFilter}
                />
            ),
        },
        {
            accessorKey: 'manager',
            header: (
                <ColumnHeader
                    title="МЕНЕДЖЕР"
                    col="manager"
                    sortAndFilter={sortAndFilter}
                    setSortAndFilter={setSortAndFilter}
                />
            ),
            cell: (value) => value.getValue().name + ' ' +  value.getValue().last_name
        },
        {
            accessorKey: 'client',
            header: (
                <ColumnHeader
                    title="КЛИЕНТ"
                    col="client"
                    sortAndFilter={sortAndFilter}
                    setSortAndFilter={setSortAndFilter}
                />
            ),
        },
        {
            accessorKey: 'project_number',
            header: (
                <ColumnHeader
                    title="НОМЕР ПРОЕКТА"
                    col="project_number"
                    sortAndFilter={sortAndFilter}
                    setSortAndFilter={setSortAndFilter}
                />
            ),
        },
                {
            accessorKey: 'inn',
            header: (
                <ColumnHeader
                    title="ИНН"
                    col="inn"
                    sortAndFilter={sortAndFilter}
                    setSortAndFilter={setSortAndFilter}
                />
            ),
        },
        {
            accessorKey: 'stage',
            header: (
                <ColumnHeader
                    title="ЭТАП"
                    col="stage_id"
                    sortAndFilter={sortAndFilter}
                    setSortAndFilter={setSortAndFilter}
                />
            ),
            cell: (value) => {
                return (
                    <div className="text-xs font-medium p-1 bg-gray-100 text-gray-800 flex justify-center">
                        {value.getValue().name?? 'Unknown'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'date',
            header: (
                <ColumnHeader
                    title="ДАТА"
                    col="date"
                    sortAndFilter={sortAndFilter}
                    setSortAndFilter={setSortAndFilter}
                />
            ),
            cell: (value) => new Date(value.getValue()).toLocaleString()
        },
    ], [sortAndFilter]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await axios.get(route('projects.index'), {
                params: { page: page + 1, perPage, ...sortAndFilter },
            });
            setData(res.data.data);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, [page, perPage, sortAndFilter]);

    const handlePageChange = (_, newPage) => setPage(newPage);
    const handleRowsPerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Layout>
            <div className="bg-white shadow-md shadow-blue-100 rubik">
                <FTable
                    columns={columns}
                    data={data}
                    total={total}
                    loading={loading}
                    page={page}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    title="Проекты"
                    additionl={() => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.get(route('projects.create'))}
                                className="cursor-pointer hover:bg-blue-600 transition-colors text-sm rubik font-semibold rounded-sm bg-[#7700ff] p-3 text-white"
                            >
                                Новый
                            </button>
                        </div>
                    )}
                />
            </div>
        </Layout>
    );
};

export default Index;
