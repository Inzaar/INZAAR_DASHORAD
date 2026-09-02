import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Search, Lock, Unlock, FileText, Volume2, PlayCircle, ChevronLeft, ChevronRight, X, Download, Loader2, ExternalLink, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { CustomPagination } from '@/components/ui/Pagination';

const forceDownload = async (url, filename, setDownloadingIdx, idx) => {
    if (setDownloadingIdx) setDownloadingIdx(idx);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        const buffer = await response.arrayBuffer();
        const ext = filename.split('.').pop().toLowerCase();
        const mimeType = ext === 'pdf' ? 'application/pdf' : (ext === 'mp3' ? 'audio/mpeg' : 'application/octet-stream');
        const blob = new Blob([buffer], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 100);
    } catch (error) {
        console.error('Download failed:', error);
        let downloadUrl = url;
        
        let iframe = document.getElementById('hidden-download-iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'hidden-download-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        iframe.src = downloadUrl;
    } finally {
        if (setDownloadingIdx) {
            setDownloadingIdx(null);
        }
    }
};

const PdfResourcesPopover = ({ popover, onClose, onSelectResource }) => {
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleScrollOrResize = () => onClose();

        // Delay attaching to prevent immediate close on button click
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
            window.addEventListener('scroll', handleScrollOrResize, true);
            window.addEventListener('resize', handleScrollOrResize);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [onClose]);

    if (!popover) return null;

    const { rect, urls } = popover;

    // Position popover to the left of the button, centered vertically
    const popoverWidth = 192; // w-48 is 192px
    const popoverHeight = 110; // estimate
    const top = rect.top + window.scrollY + (rect.height / 2) - (popoverHeight / 2);
    const left = rect.left + window.scrollX - popoverWidth - 12;

    const { t } = useTranslation();
    return ReactDOM.createPortal(
        <div 
            ref={popoverRef}
            style={{ top: `${top}px`, left: `${left}px` }}
            className="absolute z-[10002] w-48 bg-[#F9F9F8] rounded-[18px] border border-gray-100 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] animate-in fade-in zoom-in-95 duration-150"
        >
            <span className="text-[10px] font-bold text-gray-400 tracking-wider mb-2.5 block text-left">
                {t('pdf_resources', 'PDF RESOURCES')}
            </span>
            <div className="space-y-1.5 text-left">
                {urls.map((url, idx) => {
                    const resourceName = `Resource ${idx + 1}`;
                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                onSelectResource(url, resourceName);
                                onClose();
                            }}
                            className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-gray-200/50 cursor-pointer transition-colors group"
                        >
                            <div className="w-6 h-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FileText size={12} />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 truncate">
                                {t('resource', 'Resource')} {idx + 1}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>,
        document.body
    );
};

const PdfViewerModal = ({ viewingPdf, onClose }) => {
    const [downloading, setDownloading] = useState(false);
    const [zoom, setZoom] = useState(1.0); // 1.0 = 100%
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const { t } = useTranslation();

    const url = viewingPdf?.url;
    const filename = viewingPdf?.filename;

    useEffect(() => {
        if (!url) return;
        let active = true;
        let localBlobUrl = null;

        setLoadingPdf(true);
        setPdfError(null);
        setPdfBlobUrl(null);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch PDF');
                return res.arrayBuffer();
            })
            .then(buffer => {
                if (!active) return;
                const blob = new Blob([buffer], { type: 'application/pdf' });
                localBlobUrl = URL.createObjectURL(blob);
                setPdfBlobUrl(localBlobUrl);
                setLoadingPdf(false);
            })
            .catch(err => {
                if (!active) return;
                console.error('Error fetching PDF:', err);
                setPdfError('Failed to load PDF preview. Use the Download button to save the file.');
                setLoadingPdf(false);
            });

        return () => {
            active = false;
            if (localBlobUrl) {
                URL.revokeObjectURL(localBlobUrl);
            }
        };
    }, [url]);

    if (!viewingPdf) return null;

    const handleDownload = async () => {
        setDownloading(true);
        try {
            if (pdfBlobUrl) {
                const link = document.createElement('a');
                link.href = pdfBlobUrl;
                link.download = filename || 'document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                await forceDownload(url, filename, () => {}, 0);
            }
        } finally {
            setDownloading(false);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-200 animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div 
                className="relative bg-white rounded-[28px] w-full max-w-4xl h-[90vh] max-h-[750px] overflow-hidden shadow-[0_32px_80px_-15px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                            <FileText size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                {t('document_resource', 'Document Resource')}
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium">{t('viewing_lecture_materials', 'Viewing lecture materials')}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {downloading ? (
                                <Loader2 size={12} className="animate-spin text-gray-500" />
                            ) : (
                                <Download size={12} />
                            )}
                            {t('download', 'Download')}
                        </button>
                        
                        <button 
                            onClick={onClose} 
                            className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* PDF Container (Dark iframe Area) */}
                <div className="flex-1 bg-[#2D2D2D] p-6 relative overflow-auto flex items-center justify-center">
                    {loadingPdf && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#2D2D2D] z-10 text-white">
                            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                            <span className="text-sm font-medium text-gray-300">Loading document preview...</span>
                        </div>
                    )}
                    
                    {pdfError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#2D2D2D] z-10 text-white px-6 text-center">
                             <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                                 <FileText size={24} />
                             </div>
                             <div className="max-w-md">
                                 <p className="text-sm font-semibold text-gray-200">{pdfError}</p>
                                 <p className="text-xs text-gray-400 mt-1">{t('download_directly_desc', 'You can still download the document directly using the button above.')}</p>
                             </div>
                             <button
                                 onClick={handleDownload}
                                 className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-semibold text-white transition-colors shadow-sm"
                             >
                                 <Download size={12} />
                                 {t('download_document', 'Download Document')}
                             </button>
                         </div>
                    ) : (
                        pdfBlobUrl && (
                            <div 
                                className="w-full max-w-2xl h-full transition-all duration-150"
                                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                            >
                                <iframe
                                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                                    className="w-full h-full border-0 rounded-lg shadow-inner bg-white"
                                    title="PDF Viewer"
                                />
                            </div>
                        )
                    )}

                    {/* External Link Button */}
                    <button
                        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                        className="absolute top-8 right-8 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all shadow-md"
                        title="Open in new tab"
                    >
                        <ExternalLink size={16} />
                    </button>

                    {/* Custom Bottom Zoom/Page Toolbar */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/85 text-white px-5 py-2.5 rounded-full flex items-center gap-4 text-xs font-medium backdrop-blur-md shadow-lg border border-white/10 select-none">
                        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-gray-300">
                            <span>Page</span>
                            <span className="bg-white/10 px-2 py-0.5 rounded border border-white/10 text-white min-w-[20px] text-center font-bold">1</span>
                            <span>/ 1</span>
                        </div>
                        <div className="h-3 w-px bg-white/20" />
                        <div className="flex items-center gap-3 text-gray-300">
                            <button 
                                onClick={handleZoomOut} 
                                className="hover:text-white transition-colors p-1 hover:scale-110 active:scale-95"
                                title="Zoom Out"
                            >
                                <Minus size={14} />
                            </button>
                            <Search size={12} className="opacity-50" />
                            <button 
                                onClick={handleZoomIn} 
                                className="hover:text-white transition-colors p-1 hover:scale-110 active:scale-95"
                                title="Zoom In"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const ResourcesModal = ({ activeResources, onClose }) => {
    const [downloadingIdx, setDownloadingIdx] = useState(null);
    const { t } = useTranslation();

    if (!activeResources) return null;

    const { lectureNo, title, type, urls } = activeResources;
    const isPdf = type === 'pdf';

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-200 animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div 
                className="relative bg-white rounded-[28px] w-full max-w-md overflow-hidden shadow-[0_32px_80px_-15px_rgba(0,0,0,0.3)] border border-gray-100 p-6 flex flex-col animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            {isPdf ? <FileText size={20} /> : <Volume2 size={20} />}
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {lectureNo} {isPdf ? t('pdf_notes', 'PDF Notes') : t('audio_resources', 'Audio Resources')}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium truncate max-w-[240px]">{t(title, title)}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Resource List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar text-left">
                    {urls.map((url, idx) => {
                        let filename = url.split('/').pop()?.split('?')[0] || `${type}_resource_${idx + 1}`;
                        if (isPdf && !filename.toLowerCase().endsWith('.pdf')) {
                            filename += '.pdf';
                        } else if (!isPdf && !filename.toLowerCase().endsWith('.mp3')) {
                            filename += '.mp3';
                        }
                        const isDownloading = downloadingIdx === idx;
                        const resourceDisplayName = isPdf 
                            ? `${t('handout_note_part', 'Handout Note Part')} ${idx + 1}`
                            : `${t('audio_lecture_part', 'Audio Lecture Part')} ${idx + 1}`;

                        return (
                            <div 
                                key={idx}
                                onClick={() => !isDownloading && forceDownload(url, filename, setDownloadingIdx, idx)}
                                className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all duration-200 group active:scale-[0.99] ${
                                    isPdf 
                                        ? 'bg-slate-50 hover:bg-red-50/40 border-slate-100 hover:border-red-100' 
                                        : 'bg-slate-50 hover:bg-blue-50/40 border-slate-100 hover:border-blue-100'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? 'bg-red-100/50 text-red-500' : 'bg-blue-100/50 text-blue-500'}`}>
                                        {isPdf ? <FileText size={16} /> : <Volume2 size={16} />}
                                    </div>
                                    <div className="text-left min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate pr-2">
                                            {resourceDisplayName}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[180px]">
                                            {filename}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    disabled={isDownloading}
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                                        isDownloading 
                                            ? 'bg-gray-100 text-gray-400' 
                                            : `bg-white text-gray-600 border border-gray-100 shadow-sm group-hover:scale-105 ${
                                                isPdf ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-blue-500 hover:text-white'
                                            }`
                                    }`}
                                >
                                    {isDownloading ? (
                                        <Loader2 size={14} className={`animate-spin ${isPdf ? 'text-red-500' : 'text-blue-500'}`} />
                                    ) : (
                                        <Download size={14} className="group-hover:animate-bounce" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
};


const NotesModal = ({ activeNotes, onClose }) => {
    const { t } = useTranslation();
    if (!activeNotes) return null;

    const { lectureNo, title, notesList } = activeNotes;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-200 animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div 
                className="relative bg-white rounded-[28px] w-full max-w-md overflow-hidden shadow-[0_32px_80px_-15px_rgba(0,0,0,0.3)] border border-gray-100 p-6 flex flex-col animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                            <FileText size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {lectureNo} {t('notes', 'Notes')}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium truncate max-w-[240px]">{t(title, title)}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Notes List */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto custom-modal-scrollbar text-left">
                    {notesList.map((note, idx) => (
                        <div 
                            key={note.id || idx}
                            className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 hover:bg-slate-100/50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[#3758EE] font-mono text-xs bg-blue-50 px-2 py-0.5 rounded font-semibold">
                                    {note.timestamp}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                {note.text}
                            </p>
                        </div>
                    ))}
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .custom-modal-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .custom-modal-scrollbar {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}} />
            </div>
        </div>,
        document.body
    );
};

const LectureListTable = ({ lectures, notes, onWatch, currentLectureId, isAdminView }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeResources, setActiveResources] = useState(null);
    const [pdfPopover, setPdfPopover] = useState(null);
    const [viewingPdf, setViewingPdf] = useState(null);
    const [activeNotes, setActiveNotes] = useState(null);
    const { t } = useTranslation();
    const itemsPerPage = 5;

    // Filter lectures based on search term (lecture number)
    const filteredLectures = lectures.filter(lecture =>
        lecture.lectureNo.toString().includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredLectures.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLectures = filteredLectures.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const formatDate = (date) => {
        if (!date) return '05-Feb-2025'; // Default match screenshot if missing
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/ /g, '-');
    };

    return (
        <div className="bg-white rounded-[20px] p-8 shadow-sm mt-8 border border-gray-100">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-[22px] font-bold text-gray-900 leading-[1.8] pt-2 pb-2">{t('lecture_list', 'Lecture List')}</h2>
                    <p className="text-gray-400 text-sm leading-[1.8]">{t('manage_your_lecture', 'Manage your lecture')}</p>
                </div>
                <div className="flex w-full md:w-auto">
                    <div className="relative flex-1 md:w-[320px]">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('search_by_lecture_no', 'Search by lecture no')}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm animate-none"
                        />
                    </div>
                    <button className="bg-[#6366F1] text-white px-6 py-2.5 rounded-r-lg flex items-center gap-2 hover:bg-[#5558e6] transition-colors">
                        <Search className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('search', 'Search')}</span>
                    </button>
                </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto custom-scrollbar-thin -mx-4 sm:mx-0 max-h-[400px]">
                <div className="min-w-[1000px] px-4 sm:px-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                            <tr className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">
                                <th className="px-6 py-4 w-[15%]">{t('lecture_no', 'Lecture No')}</th>
                                <th className="px-6 py-4 w-[35%]">{t('title', 'Title')}</th>
                                <th className="px-6 py-4 text-center w-[15%]">{t('date', 'Date')}</th>
                                <th className="px-6 py-4 text-center w-[15%]">{t('progress', 'Progress')}</th>
                                <th className="px-6 py-4 text-center w-[10%]">{t('status', 'Status')}</th>
                                {!isAdminView && <th className="px-6 py-4 text-center w-[10%]">{t('comments', 'Comments')}</th>}
                                <th className="px-6 py-4 text-center w-[10%]">{t('action', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentLectures.map((lecture, index) => {
                                const isCurrent = lecture.id === currentLectureId;
                                const progress = lecture.watchedPercentage || 0;
                                const lectureNotes = notes.filter(n => n.lectureId === lecture.id);
                                const latestNote = lectureNotes.length > 0 ? lectureNotes[lectureNotes.length - 1].text : 'N/A';

                                const displayLectureNo = typeof lecture.lectureNo === 'string' && lecture.lectureNo.startsWith('#')
                                    ? lecture.lectureNo
                                    : `#${String(lecture.lectureNo).padStart(2, '0')}`;

                                return (
                                    <tr key={lecture.id} className={`text-sm text-gray-600 hover:bg-gray-50/50 transition-colors ${isCurrent ? 'bg-blue-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{displayLectureNo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{t(lecture.title, lecture.title)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-500">{formatDate(lecture.date)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[#3758EE] font-bold">{String(progress).padStart(2, '0')}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                                                    !lecture.isLocked ? 'text-emerald-500 bg-emerald-50' : 'text-gray-500 bg-gray-50'
                                                }`}>
                                                    {lecture.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                                    {lecture.isLocked ? t('locked', 'Locked') : t('unlocked', 'Unlocked')}
                                                </span>
                                            </div>
                                        </td>
                                        {!isAdminView && (
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    {lectureNotes.length > 0 ? (
                                                        <button
                                                            onClick={() => setActiveNotes({
                                                                lectureNo: displayLectureNo,
                                                                title: lecture.title,
                                                                notesList: lectureNotes
                                                            })}
                                                            className="px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-all duration-200 shadow-xs active:scale-[0.98] cursor-pointer"
                                                        >
                                                            {t('see_notes', 'See Notes')}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="px-4 py-1.5 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-150 rounded-xl cursor-not-allowed"
                                                        >
                                                            {t('no_notes', 'No Notes')}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const pdfUrls = Array.isArray(lecture.pdfUrl) ? lecture.pdfUrl : (lecture.pdfUrl ? [lecture.pdfUrl] : []);
                                                        if (pdfUrls.length > 0) {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setPdfPopover({
                                                                lectureId: lecture.id,
                                                                rect,
                                                                lectureNo: displayLectureNo,
                                                                title: lecture.title,
                                                                urls: pdfUrls
                                                            });
                                                        }
                                                    }}
                                                    disabled={!lecture.pdfUrl || (Array.isArray(lecture.pdfUrl) && lecture.pdfUrl.length === 0)}
                                                    className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                                        !lecture.pdfUrl || (Array.isArray(lecture.pdfUrl) && lecture.pdfUrl.length === 0)
                                                            ? 'bg-red-50 text-red-300 opacity-50 cursor-not-allowed'
                                                            : 'bg-red-50 text-red-500 hover:bg-red-100 hover:scale-105 active:scale-95 shadow-sm'
                                                    }`}
                                                >
                                                    <FileText size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const audioUrls = Array.isArray(lecture.audioUrl) ? lecture.audioUrl : (lecture.audioUrl ? [lecture.audioUrl] : []);
                                                        if (audioUrls.length > 0) {
                                                            setActiveResources({
                                                                lectureNo: displayLectureNo,
                                                                title: lecture.title,
                                                                type: 'audio',
                                                                urls: audioUrls
                                                            });
                                                        }
                                                    }}
                                                    disabled={!lecture.audioUrl || (Array.isArray(lecture.audioUrl) && lecture.audioUrl.length === 0)}
                                                    className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                                        !lecture.audioUrl || (Array.isArray(lecture.audioUrl) && lecture.audioUrl.length === 0)
                                                            ? 'bg-blue-50 text-blue-300 opacity-50 cursor-not-allowed'
                                                            : 'bg-blue-50 text-blue-500 hover:bg-blue-100 hover:scale-105 active:scale-95 shadow-sm'
                                                    }`}
                                                >
                                                    <Volume2 size={14} />
                                                </button>
                                                {lecture.type === 'Assignment' ? (
                                                    <GradiantButton
                                                        onClick={() => onWatch(lecture)}
                                                        className="bg-[#3758EE] text-white text-[11px] font-bold px-4 py-1.5 rounded-[4px] hover:bg-blue-600 transition-colors shadow-none disabled:opacity-50"
                                                        disabled={lecture.isLocked}
                                                    >
                                                        {isAdminView ? t('edit_assignment', 'Edit Assignment') : t('start', 'Start')}
                                                    </GradiantButton>
                                                ) : (
                                                    <GradiantButton
                                                        onClick={() => onWatch(lecture)}
                                                        className="bg-[#3758EE] text-white text-[11px] font-bold px-4 py-1.5 rounded-[4px] hover:bg-blue-600 transition-colors shadow-none disabled:opacity-50"
                                                        disabled={lecture.isLocked}
                                                    >
                                                        {t('start', 'Start')}
                                                    </GradiantButton>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>


            {totalPages > 1 && (
                <div className="flex justify-end items-center mt-6 p-4 border-t border-gray-100 w-full">
                    <CustomPagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
            {activeResources && (
                                                <ResourcesModal 
                                                    activeResources={activeResources} 
                                                    onClose={() => setActiveResources(null)} 
                                                />
                                            )}
                                            {activeNotes && (
                                                <NotesModal 
                                                    activeNotes={activeNotes} 
                                                    onClose={() => setActiveNotes(null)} 
                                                />
                                            )}
            {pdfPopover && (
                <PdfResourcesPopover
                    popover={pdfPopover}
                    onClose={() => setPdfPopover(null)}
                    onSelectResource={(url, name) => {
                        setViewingPdf({ url, filename: name });
                    }}
                />
            )}
            {viewingPdf && (
                <PdfViewerModal
                    viewingPdf={viewingPdf}
                    onClose={() => setViewingPdf(null)}
                />
            )}
            
            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar-thin::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}} />
        </div>
    );
};

export default LectureListTable;
