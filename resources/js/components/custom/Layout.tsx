import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export function Errors({ errors }: { errors: Record<string, string> }) {
    return (
        <div className="fixed top-4 right-4 rounded bg-red-500 p-4 text-white shadow-lg z-[100]">
            {Object.values(errors).map((error, index) => (
                <div key={index}>{error}</div>
            ))}
        </div>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const { errors } = usePage().props;
    const [showErr, setShowErr] = useState(false);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setLocalErrors(errors);
            setShowErr(true);

            const timer = setTimeout(() => {
                setShowErr(false);
                setLocalErrors({});
            }, 3000); // через 3 секунды скрыть

            return () => clearTimeout(timer);
        }
    }, [errors]);

    return (
        <div className="rubik flex h-screen min-h-screen flex-col overflow-hidden bg-[#262626]">
            <Header />
            {showErr && <Errors errors={localErrors} />}
            <div className="flex flex-col h-full w-screen overflow-hidden p-2 bg-black">
                <div className="h-full w-full rounded-t-2xl overflow-auto bg-[#262626]">{children}</div>
                <Sidebar />
            </div>
        </div>
    );
}
