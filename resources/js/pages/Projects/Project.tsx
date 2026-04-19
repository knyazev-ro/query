import ClientCompanyCard from '@/components/custom/ClientCompanyCard';
import Feed from '@/components/custom/Feed';
import Layout from '@/components/custom/Layout';
import Levels from '@/components/custom/Levels';
import PickManagerCell from '@/components/custom/PickManagerCell';
import PickPipelineCell from '@/components/custom/PickPipelineCell';
import {
    CurrencyYenIcon,
    HashtagIcon,
    MapIcon,
    UserCircleIcon,
} from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Project({ project, stages }) {
    const [hoverStage, setHoverStage] = useState(null);
    const [editName, setEditName] = useState(false);

    const formData = (project) => {
        return {
            id: project.id,
            name: project?.name ?? '',
            amount: project?.amount ?? null,
            pipeline: project?.stage?.pipeline ?? null,
            stage: project?.stage ?? null,
            author: project?.author ?? null,
            stage_id: project?.stage_id ?? null,
            description: project?.description ?? '',
            pipeline_id: project?.stage?.pipeline_id ?? null,
            client: project?.client ?? null,
        };
    };

    const { data, setData } = useForm(formData(project));

    useEffect(() => {
        if (project) {
            setData(formData(project));
        }
    }, [project]);

    const pickStageColor = (stage) => {
        const stageTypeColor = {
            0: stage.options?.column_header_color ?? '#ff7f11',
            1: '#a1a7b7',
            2: '#4e9bed',
            3: '#fc3f5b',
        };
        return stageTypeColor[stage?.type] ?? '#83B94C';
    };

    const changeStyleOnHover = (stage, idx) => {
        const currentBkg =
            data?.stage?.order >= stage.order ? '#ff1b1c' : '#acbfa4';
        return {
            backgroundColor: hoverStage
                ? idx <= hoverStage
                    ? pickStageColor(stage)
                    : currentBkg
                : currentBkg,

            color: hoverStage
                ? idx <= hoverStage
                    ? stage.options?.text_header_color
                    : '#FFFFFF'
                : '#FFFFFF',
        };
    };

    const handleChangeStage = (stage) => {
        if (project?.id) {
            router.post(route('kanban.drop', [project.id, stage.id]));
        }
    };

    const handleEditDeal = (data) => {
        router.post(route('projects.update', project.id), data);
    };

    return (
        <Layout>
            <div className="flex h-full flex-col bg-[#161616] px-5 py-6 text-[#e2e8ce]">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-2xl font-bold md:flex-nowrap">
                    <div className="flex gap-2">
                        <div className="flex items-center justify-center text-xs text-gray-400">
                            <HashtagIcon className="w-4" />
                            {project.id}
                        </div>
                        <Levels level={project.level} size={4} />

                        {editName ? (
                            <div className="-m-2 flex w-full items-center gap-2">
                                <input
                                    style={{
                                        width: `${String(data.name || 0).length + 3}ch`,
                                    }}
                                    type="text"
                                    className="border-t-0 border-r-0 border-b-1 border-l-0 border-gray-300 px-2 py-1 text-2xl leading-none"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData('name', e.target.value);
                                    }}
                                    onBlur={() => {
                                        setEditName(false);
                                        handleEditDeal(data);
                                    }}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1
                                    onClick={() => setEditName(true)}
                                    className="cursor-pointer text-2xl leading-none hover:underline"
                                >
                                    {data.name ? (
                                        data.name
                                    ) : (
                                        <div className="text-gray-400">...</div>
                                    )}
                                </h1>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-center">
                        {/* <button
                            onClick={() => handleEditDeal(data)}
                            className="rounded-xs bg-[#7700ff] p-2 text-sm font-semibold text-white"
                        >
                            Сохранить
                        </button> */}
                    </div>
                </div>

                <div className="flex w-full text-sm font-bold">
                    <div className="ml-7 flex w-full">
                        {stages.map((stage, idx) => (
                            <div
                                key={stage.id ?? idx}
                                style={{
                                    zIndex: stages.length - idx,
                                    position: 'relative',
                                }}
                                className="kanban-column -ml-7 flex min-w-0 flex-1 items-center justify-center rounded-l-lg bg-[#262626] px-1.5"
                            >
                                <div
                                    onClick={() => handleChangeStage(stage)}
                                    onMouseEnter={() => setHoverStage(idx)}
                                    onMouseLeave={() => setHoverStage(null)}
                                    className="kanban-column w-full cursor-pointer truncate rounded-l-lg bg-indigo-600 py-1.5 pl-7 text-center whitespace-nowrap text-white transition-colors duration-200"
                                    style={changeStyleOnHover(stage, idx)}
                                >
                                    {stage.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Горизонтальная информация */}
                <div className="flex w-full flex-col items-stretch justify-between border-b border-white/10 px-6 py-3 text-sm md:flex-row md:items-center md:gap-2">
                    {/* amount */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-2 transition-all duration-200 hover:bg-white/5">
                        <CurrencyYenIcon className="w-5 shrink-0 opacity-70" />

                        <div className="flex min-w-0 flex-col">
                            <div className="text-xs text-gray-400">Сумма</div>

                            <div className="flex items-center">
                                <input
                                    className="border-b border-transparent bg-transparent text-sm text-white transition-all outline-none focus:border-white/30"
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.length <= 12) {
                                            setData('amount', val);
                                        }
                                    }}
                                    onBlur={() => handleEditDeal(data)}
                                    style={{
                                        width: `${String(data.amount || 0).length + 2}ch`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* pipeline */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-2 transition-all duration-200 hover:bg-white/5">
                        <MapIcon className="w-5 shrink-0 opacity-70" />

                        <div className="flex min-w-0 flex-col">
                            <div className="text-xs text-gray-400">Воронка</div>
                            <div className="min-w-0">
                                <PickPipelineCell
                                    data={data}
                                    handleEditDeal={handleEditDeal}
                                />
                            </div>
                        </div>
                    </div>

                    {/* author */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-2 transition-all duration-200 hover:bg-white/5">
                        <UserCircleIcon className="w-5 shrink-0 opacity-70" />

                        <div className="flex min-w-0 flex-col">
                            <div className="text-xs text-gray-400">Автор</div>

                            <div className="min-w-0">
                                <PickManagerCell
                                    data={data}
                                    handleEditDeal={handleEditDeal}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex h-fit gap-2 overflow-y-auto">
                    {/* Левая часть — красивая версия */}
                    {/* Левая часть */}
                    <div className="flex h-fit w-full max-w-md flex-col gap-5 border-r-1 border-white/10 p-5">
                        {/* Заголовок */}
                        <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
                            <h2 className="text-base font-semibold text-white">
                                Основные данные
                            </h2>
                            <span className="text-xs text-gray-500">
                                Информация о проекте
                            </span>
                        </div>

                        {/* Описание */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">
                                Описание проекта
                            </label>

                            <input
                                value={data.description}
                                type="text"
                                placeholder="Введите описание..."
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/20 focus:bg-white/10 focus:ring-1 focus:ring-white/10"
                            />
                        </div>

                        {/* CLIENT BLOCK */}
                        <div className="pt-2">
                            <ClientCompanyCard client={data.client} />
                        </div>
                    </div>

                    {/* Правая часть */}
                    <div className="flex w-full flex-col">
                        <Feed entityId={data.id} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
