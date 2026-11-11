import React, { useState } from 'react';
import { X, Send, RotateCcw, Clock, HelpCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { requestAssignmentExtension } from '@/api/course';

const RequestExtensionModal = ({ isOpen, onClose, assignment, enrollmentId, onSuccess }) => {
    const { t } = useTranslation();

    const isExhausted = Boolean(assignment?.isAttemptsExhausted);
    const isLate = Boolean(assignment?.isLate);

    const defaultType = isExhausted && isLate ? 'both' : (isLate ? 'due_date' : 'attempt');
    const [requestType, setRequestType] = useState(defaultType);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const courseId = assignment?.courseId;
    const assignmentId = assignment?._id || assignment?.id || assignment?.assignmentId;

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!message.trim()) {
            toast.error(t('enter_request_reason', 'Please provide a reason for your request.'));
            return;
        }

        if (!courseId || !assignmentId) {
            toast.error(t('missing_assignment_info', 'Missing assignment information.'));
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await requestAssignmentExtension(
                courseId,
                assignmentId,
                requestType,
                message.trim(),
                enrollmentId
            );

            toast.success(
                res?.assignedTo === 'moderator'
                    ? t('request_sent_moderator', 'Request submitted! Your assigned moderator has been notified.')
                    : t('request_sent_admin', 'Request submitted! An administrator has been notified.')
            );

            if (onSuccess) onSuccess(res);
            onClose();
        } catch (err) {
            console.error('Failed to submit exception request', err);
            const errorMsg = err?.response?.data?.message || t('request_failed', 'Failed to send request. Please try again.');
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                {t('request_exception_title', 'Request Assignment Exception')}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">
                                {assignment?.title || t('assignment', 'Assignment')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {/* Notice */}
                    <div className="bg-[#F8F9FA] rounded-xl p-3.5 border border-gray-200 text-xs text-gray-600 leading-relaxed font-medium">
                        {t(
                            'request_notice',
                            'Submit your request explaining why you need an extra attempt or due date extension. Your request will be reviewed by your assigned moderator or course admin.'
                        )}
                    </div>

                    {/* Request Type Selector */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            {t('what_do_you_need', 'What do you need?')}
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setRequestType('attempt')}
                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                                    requestType === 'attempt'
                                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <RotateCcw size={16} />
                                <span className="text-xs font-bold">{t('extra_attempt', '+1 Attempt')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRequestType('due_date')}
                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                                    requestType === 'due_date'
                                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <Clock size={16} />
                                <span className="text-xs font-bold">{t('extend_deadline', 'Extend Date')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRequestType('both')}
                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                                    requestType === 'both'
                                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <HelpCircle size={16} />
                                <span className="text-xs font-bold">{t('both', 'Both')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Message input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            {t('reason_message_label', 'Reason & Details')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t(
                                'reason_placeholder',
                                'Explain your reason (e.g., uploaded wrong file, corrupted PDF, medical reason, power outage)...'
                            )}
                            className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {t('cancel', 'Cancel')}
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#2055A5] to-[#8C6DFD] hover:opacity-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>{t('sending', 'Sending...')}</span>
                                </>
                            ) : (
                                <>
                                    <Send size={14} />
                                    <span>{t('send_request', 'Send Request')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestExtensionModal;

