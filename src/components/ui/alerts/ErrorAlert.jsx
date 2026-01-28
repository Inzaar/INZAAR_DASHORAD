import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ message }) => {
    if (!message) return null;

    return (
        <div className="w-full max-w-[500px] flex items-start gap-3 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed">
                {message}
            </div>
        </div>
    );
};

export default ErrorAlert;
