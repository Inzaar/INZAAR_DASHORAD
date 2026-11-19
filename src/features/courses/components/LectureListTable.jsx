import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Search, Lock, Unlock, FileText, Volume2, PlayCircle, ChevronLeft, ChevronRight, X, Download, Loader2, ExternalLink, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { CustomPagination } from '@/components/ui/Pagination';

const formatResourceUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('/')) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const serverOrigin = apiBase ? apiBase.replace(/\/api\/v1\/?$/, '') : 'https://inzaar.duckdns.org';
        return `${serverOrigin}${url}`;
    }
    return url;
};

const isImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.split('?')[0].toLowerCase();
    return clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.png') || clean.endsWith('.webp') || clean.endsWith('.gif') || clean.endsWith('.svg');
};

const getPdfEmbedUrl = (url) => {
    if (!url) return '';
    const formattedUrl = formatResourceUrl(url);
    if (formattedUrl.includes('drive.google.com')) {
        const matchD = formattedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const fileId = matchD ? matchD[1] : (formattedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]);
        if (fileId) {
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }
    return formattedUrl;
};

const getAudioSrc = (url) => {
    if (!url) return '';
    const formattedUrl = formatResourceUrl(url);
    if (formattedUrl.includes('drive.google.com') || formattedUrl.includes('drive.usercontent.google.com')) {
        const matchD = formattedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const matchId = formattedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        const fileId = matchD ? matchD[1] : (matchId ? matchId[1] : null);
        if (fileId) {
            return `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
        }
    }
    return formattedUrl;
};

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
                    const isObj = typeof url === 'object' && url !== null;
                    const resourceUrl = isObj ? (url.url || '') : url;
                    const resourceName = isObj ? (url.title || `Resource ${idx + 1}`) : `Resource ${idx + 1}`;
                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                onSelectResource(resourceUrl, resourceName);
                                onClose();
                            }}
                            className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-gray-200/50 cursor-pointer transition-colors group"
                        >
                            <div className="w-6 h-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FileText size={12} />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 truncate">
                                {resourceName}
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
    const [loadingPdf, setLoadingPdf] = useState(true);
    const { t } = useTranslation();

    const url = viewingPdf?.url;
    const filename = viewingPdf?.filename;

    useEffect(() => {
        setLoadingPdf(true);
    }, [url]);

    if (!viewingPdf) return null;

    const handleDownload = async () => {
        if (!url) return;
        const cleanTargetUrl = formatResourceUrl(url);
        setDownloading(true);
        try {
            if (cleanTargetUrl.includes('drive.google.com')) {
                const matchD = cleanTargetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                const fileId = matchD ? matchD[1] : (cleanTargetUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]);
                if (fileId) {
                    window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, '_blank');
                    return;
                }
            }
            const rawName = filename || cleanTargetUrl.split('/').pop()?.split('?')[0] || 'resource';
            const isImg = isImageUrl(cleanTargetUrl);
            const finalDownloadName = rawName.includes('.') ? rawName : `${rawName}.${isImg ? 'jpg' : 'pdf'}`;

            const response = await fetch(cleanTargetUrl);
            if (!response.ok) throw new Error('Fetch failed');
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = finalDownloadName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch {
            const rawName = filename || cleanTargetUrl.split('/').pop()?.split('?')[0] || 'resource';
            const isImg = isImageUrl(cleanTargetUrl);
            const finalDownloadName = rawName.includes('.') ? rawName : `${rawName}.${isImg ? 'jpg' : 'pdf'}`;
            const link = document.createElement('a');
            link.href = cleanTargetUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.download = finalDownloadName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
                            <p className="text-[11px] text-gray-500 font-medium">{t('resource', 'Resource')}</p>
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

                {/* PDF / Resource Container */}
                <div className="flex-1 bg-[#2D2D2D] p-6 relative overflow-auto flex items-center justify-center">
                    {loadingPdf && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#2D2D2D] z-10 text-white">
                            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                            <span className="text-sm font-medium text-gray-300">Loading document preview...</span>
                        </div>
                    )}
                    
                    {isImageUrl(url) ? (
                        <div 
                            className="w-full max-w-4xl h-full flex items-center justify-center transition-all duration-150 overflow-auto"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                        >
                            <img
                                src={formatResourceUrl(url)}
                                alt={filename || "Resource"}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                onLoad={() => setLoadingPdf(false)}
                            />
                        </div>
                    ) : (
                        <div 
                            className="w-full max-w-4xl h-full transition-all duration-150"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                        >
                            <iframe
                                src={getPdfEmbedUrl(url)}
                                className="w-full h-full border-0 rounded-lg shadow-inner bg-white"
                                title="PDF Viewer"
                                onLoad={() => setLoadingPdf(false)}
                            />
                        </div>
                    )}

                    {/* External Link Button */}
                    <button
                        onClick={() => window.open(formatResourceUrl(url), '_blank', 'noopener,noreferrer')}
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

const ResourcesModal = ({ activeResources, onClose, onSelectPdf, onSelectAudio }) => {
    const { t } = useTranslation();

    if (!activeResources) return null;

    const { lectureNo, title, defaultTab = 'pdf', pdfUrls = [], audioUrls = [] } = activeResources;
    const [selectedTab, setSelectedTab] = useState(defaultTab || 'all');

    useEffect(() => {
        if (activeResources?.defaultTab) {
            setSelectedTab(activeResources.defaultTab);
        }
    }, [activeResources]);

    const hasPdfs = pdfUrls.length > 0;
    const hasAudios = audioUrls.length > 0;
    const hasBoth = hasPdfs && hasAudios;

    // Filter items based on selectedTab
    const showPdfs = selectedTab === 'all' || selectedTab === 'pdf';
    const showAudios = selectedTab === 'all' || selectedTab === 'audio';

    const items = [
        ...(showPdfs ? pdfUrls.map((item, idx) => ({ item, type: 'pdf', idx: `pdf-${idx}` })) : []),
        ...(showAudios ? audioUrls.map((item, idx) => ({ item, type: 'audio', idx: `audio-${idx}` })) : []),
    ];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-200 animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div 
                className="relative bg-white rounded-[24px] sm:rounded-[28px] w-full max-w-md overflow-hidden shadow-[0_32px_80px_-15px_rgba(0,0,0,0.3)] border border-gray-100 p-5 sm:p-6 flex flex-col animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            selectedTab === 'audio' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'
                        }`}>
                            {selectedTab === 'audio' ? <Volume2 size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="text-left">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                                {lectureNo} {t('resources', 'Resources')}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium truncate max-w-[220px] sm:max-w-[260px]">{t(title, title)}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Filter Tabs if both PDF and Audio are present */}
                {hasBoth && (
                    <div className="flex items-center p-1 bg-gray-100/90 rounded-xl mb-3.5 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setSelectedTab('all')}
                            className={`flex-1 py-1.5 rounded-lg transition-all ${
                                selectedTab === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {t('all', 'All')} ({pdfUrls.length + audioUrls.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('pdf')}
                            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                                selectedTab === 'pdf' ? 'bg-white text-red-600 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <FileText size={12} />
                            <span>PDFs ({pdfUrls.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('audio')}
                            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                                selectedTab === 'audio' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <Volume2 size={12} />
                            <span>Audio ({audioUrls.length})</span>
                        </button>
                    </div>
                )}

                {/* Resource List */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 small-scroller text-left">
                    {items.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-xs">
                            {t('no_resources_found', 'No resources available')}
                        </div>
                    ) : (
                        items.map(({ item, type, idx }) => {
                            const isPdf = type === 'pdf';
                            const isObj = typeof item === 'object' && item !== null;
                            const resourceUrl = formatResourceUrl(isObj ? (item.url || '') : item);
                            const adminTitle = isObj ? item.title : null;
                            let filename = resourceUrl.split('/').pop()?.split('?')[0] || `${type}_resource`;
                            if (isPdf && !filename.toLowerCase().endsWith('.pdf')) {
                                filename += '.pdf';
                            } else if (!isPdf && !filename.toLowerCase().endsWith('.mp3')) {
                                filename += '.mp3';
                            }
                            const resourceDisplayName = adminTitle || (isPdf 
                                ? `${t('handout_note', 'Handout Document')} ${idx.split('-')[1] ? Number(idx.split('-')[1]) + 1 : ''}`.trim()
                                : `${t('audio_lecture', 'Audio Recording')} ${idx.split('-')[1] ? Number(idx.split('-')[1]) + 1 : ''}`.trim());

                            const handleItemClick = (e) => {
                                if (e) e.stopPropagation();
                                if (isPdf) {
                                    if (onSelectPdf) {
                                        onSelectPdf(resourceUrl, filename);
                                    } else {
                                        window.open(resourceUrl, '_blank');
                                    }
                                } else {
                                    if (onSelectAudio) {
                                        onSelectAudio(resourceUrl, filename);
                                    } else {
                                        window.open(resourceUrl, '_blank');
                                    }
                                }
                            };

                            return (
                                <div 
                                    key={idx}
                                    onClick={handleItemClick}
                                    className={`flex items-center justify-between p-3 border rounded-2xl cursor-pointer transition-all duration-200 group active:scale-[0.99] ${
                                        isPdf 
                                            ? 'bg-slate-50/80 hover:bg-red-50/40 border-slate-100 hover:border-red-200' 
                                            : 'bg-slate-50/80 hover:bg-blue-50/40 border-slate-100 hover:border-blue-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                            isPdf ? 'bg-red-100/70 text-red-500' : 'bg-blue-100/70 text-blue-500'
                                        }`}>
                                            {isPdf ? <FileText size={16} /> : <Volume2 size={16} />}
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                                    {resourceDisplayName}
                                                </p>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                    isPdf ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                    {isPdf ? 'PDF' : 'Audio'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[180px] sm:max-w-[220px] mt-0.5">
                                                {filename}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center shrink-0 ml-2">
                                        <button 
                                            type="button"
                                            onClick={handleItemClick}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border shadow-2xs active:scale-95 cursor-pointer ${
                                                isPdf 
                                                    ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' 
                                                    : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                                            }`}
                                        >
                                            {isPdf ? t('view', 'View') : t('listen', 'Listen')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
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

const LectureListTable = ({ lectures = [], notes = [], onWatch, currentLectureId, isAdminView, onOpenPdf, onOpenAudio, loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeResources, setActiveResources] = useState(null);
    const [pdfPopover, setPdfPopover] = useState(null);
    const [viewingPdf, setViewingPdf] = useState(null);
    const [playingAudioUrl, setPlayingAudioUrl] = useState(null);
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
        <div className="bg-white rounded-[20px] p-3.5 sm:p-5 md:p-6 shadow-sm mt-6 sm:mt-8 border border-gray-100">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{t('lecture_list', 'Lecture List')}</h2>
                    <p className="text-gray-400 text-xs leading-normal mt-0.5">{t('manage_your_lecture', 'Manage your lecture')}</p>
                </div>

                {/* Search Bar */}
                <div className="flex w-full md:w-auto">
                    <div className="relative flex-1 md:w-[280px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('search_by_lecture_no', 'Search by lecture no')}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                        />
                    </div>
                    <button className="bg-[#6366F1] text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-r-lg flex items-center gap-1.5 hover:bg-[#5558e6] transition-colors shrink-0">
                        <Search className="h-3.5 w-3.5" />
                        <span className="text-xs sm:text-sm font-medium">{t('search', 'Search')}</span>
                    </button>
                </div>
            </div>

            {/* Table view */}
            <div className="overflow-x-auto small-scroller -mx-1 sm:mx-0 max-h-[440px] md:max-h-none">
                <div className="w-full min-w-[540px] sm:min-w-full px-1 sm:px-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
                            <tr className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-2.5 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 w-[14%] whitespace-nowrap">{t('lecture_no', 'Lecture No')}</th>
                                <th className="px-2.5 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 w-[34%] min-w-[130px] sm:min-w-[180px] md:min-w-[240px]">{t('title', 'Title')}</th>
                                <th className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-center w-[13%] whitespace-nowrap">{t('date', 'Date')}</th>
                                <th className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-center w-[11%] whitespace-nowrap">{t('progress', 'Progress')}</th>
                                <th className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-center w-[10%] whitespace-nowrap">{t('status', 'Status')}</th>
                                {!isAdminView && <th className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-center w-[10%] whitespace-nowrap">{t('notes', 'Notes')}</th>}
                                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-center w-[12%] whitespace-nowrap">{t('action', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="text-xs sm:text-sm border-b border-gray-100 animate-pulse">
                                        <td className="px-2.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                                            <div className="h-3.5 w-10 bg-gray-200 rounded" />
                                        </td>
                                        <td className="px-2.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                                            <div className="h-3.5 w-4/5 bg-gray-200 rounded" />
                                        </td>
                                        <td className="px-1.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center">
                                            <div className="h-3.5 w-14 bg-gray-200 rounded mx-auto" />
                                        </td>
                                        <td className="px-1.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center">
                                            <div className="h-3.5 w-8 bg-gray-200 rounded mx-auto" />
                                        </td>
                                        <td className="px-1.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center">
                                            <div className="h-5 w-14 bg-gray-200 rounded-full mx-auto" />
                                        </td>
                                        {!isAdminView && (
                                            <td className="px-1.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center">
                                                <div className="h-6 w-14 bg-gray-200 rounded-lg mx-auto" />
                                            </td>
                                        )}
                                        <td className="px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center">
                                            <div className="h-6 w-14 bg-gray-200 rounded mx-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : currentLectures.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdminView ? 6 : 7} className="px-4 py-10 text-center text-xs sm:text-sm text-gray-400">
                                        {t('no_lectures_found', 'No lectures found')}
                                    </td>
                                </tr>
                            ) : (
                                currentLectures.map((lecture) => {
                                    const isCurrent = lecture.id === currentLectureId;
                                    const progress = lecture.watchedPercentage || 0;
                                    const lectureNotes = notes.filter(n => n.lectureId === lecture.id);

                                    const displayLectureNo = typeof lecture.lectureNo === 'string' && lecture.lectureNo.startsWith('#')
                                        ? lecture.lectureNo
                                        : `#${String(lecture.lectureNo).padStart(2, '0')}`;

                                    const pdfUrls = Array.isArray(lecture.pdfUrl) ? lecture.pdfUrl : (lecture.pdfUrl ? [lecture.pdfUrl] : []);
                                    const hasPdf = pdfUrls.length > 0;
                                    const audioUrls = Array.isArray(lecture.audioUrl) ? lecture.audioUrl : (lecture.audioUrl ? [lecture.audioUrl] : []);
                                    const hasAudio = audioUrls.length > 0;

                                    return (
                                        <tr key={lecture.id} className={`text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors ${isCurrent ? 'bg-blue-50/40' : ''}`}>
                                            <td className="px-2.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap">
                                                <span className="font-semibold sm:font-medium text-gray-900 text-xs sm:text-sm">{displayLectureNo}</span>
                                            </td>
                                            <td className="px-2.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 w-[35%] max-w-[280px] sm:max-w-[340px] md:max-w-[420px]">
                                                <div
                                                    className="font-medium text-gray-900 text-xs sm:text-sm leading-snug"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        wordBreak: 'break-word',
                                                    }}
                                                    title={t(lecture.title, lecture.title)}
                                                >
                                                    {t(lecture.title, lecture.title)}
                                                </div>
                                            </td>
                                            <td className="px-1.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center whitespace-nowrap">
                                                <span className="text-gray-500 text-[11px] sm:text-xs md:text-sm">{formatDate(lecture.date)}</span>
                                            </td>
                                            <td className="px-1.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center whitespace-nowrap">
                                                <span className="text-[#3758EE] font-bold text-xs sm:text-sm">{progress}%</span>
                                            </td>
                                            <td className="px-1.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center whitespace-nowrap">
                                                <div className="flex justify-center items-center">
                                                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1 ${
                                                        !lecture.isLocked ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-gray-500 bg-gray-100 border border-gray-200'
                                                    }`}>
                                                        {lecture.isLocked ? <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Unlock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                                                        {lecture.isLocked ? t('locked', 'Locked') : t('unlocked', 'Unlocked')}
                                                    </span>
                                                </div>
                                            </td>
                                            {!isAdminView && (
                                                <td className="px-1.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center">
                                                        {lectureNotes.length > 0 ? (
                                                            <button
                                                                onClick={() => setActiveNotes({
                                                                    lectureNo: displayLectureNo,
                                                                    title: lecture.title,
                                                                    notesList: lectureNotes
                                                                })}
                                                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg sm:rounded-full transition-all duration-200 shadow-2xs active:scale-[0.98] cursor-pointer"
                                                            >
                                                                {t('see_notes', 'See Notes')}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                disabled
                                                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-gray-400 bg-gray-50 border border-gray-150 rounded-lg sm:rounded-full cursor-not-allowed"
                                                            >
                                                                {t('no_notes', 'No Notes')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (hasPdf) {
                                                                setActiveResources({
                                                                    lectureNo: displayLectureNo,
                                                                    title: lecture.title,
                                                                    defaultTab: 'pdf',
                                                                    pdfUrls,
                                                                    audioUrls
                                                                });
                                                            }
                                                        }}
                                                        disabled={!hasPdf}
                                                        title={hasPdf ? "View PDFs" : "No PDF"}
                                                        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded sm:rounded-lg flex items-center justify-center transition-all ${
                                                            !hasPdf
                                                                ? 'bg-red-50 text-red-300 opacity-40 cursor-not-allowed'
                                                                : 'bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 shadow-2xs cursor-pointer'
                                                        }`}
                                                    >
                                                        <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (hasAudio) {
                                                                setActiveResources({
                                                                    lectureNo: displayLectureNo,
                                                                    title: lecture.title,
                                                                    defaultTab: 'audio',
                                                                    pdfUrls,
                                                                    audioUrls
                                                                });
                                                            }
                                                        }}
                                                        disabled={!hasAudio}
                                                        title={hasAudio ? "Listen Audio" : "No Audio"}
                                                        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded sm:rounded-lg flex items-center justify-center transition-all ${
                                                            !hasAudio
                                                                ? 'bg-blue-50 text-blue-300 opacity-40 cursor-not-allowed'
                                                                : 'bg-blue-50 text-blue-500 hover:bg-blue-100 active:scale-95 shadow-2xs cursor-pointer'
                                                        }`}
                                                    >
                                                        <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                                    </button>
                                                    <GradiantButton
                                                        onClick={() => onWatch(lecture)}
                                                        className="bg-[#3758EE] text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-[4px] sm:rounded-md hover:bg-blue-600 transition-colors shadow-none disabled:opacity-50"
                                                        disabled={lecture.isLocked}
                                                    >
                                                        {lecture.type === 'Assignment' && isAdminView ? t('edit_assignment', 'Edit Assignment') : t('start', 'Start')}
                                                    </GradiantButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!loading && totalPages > 1 && (
                <div className="flex justify-center sm:justify-end items-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 w-full">
                    <CustomPagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        className="justify-center sm:justify-end"
                    />
                </div>
            )}
            {activeResources && (
                <ResourcesModal 
                    activeResources={activeResources} 
                    onClose={() => setActiveResources(null)}
                    onSelectPdf={(url, filename) => {
                        setActiveResources(null);
                        if (onOpenPdf) {
                            onOpenPdf(url);
                        } else {
                            setViewingPdf({ url, filename });
                        }
                    }}
                    onSelectAudio={(url, filename) => {
                        setActiveResources(null);
                        if (onOpenAudio) {
                            onOpenAudio(url);
                        } else {
                            setPlayingAudioUrl(url);
                        }
                    }}
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
                        setPdfPopover(null);
                        if (onOpenPdf) {
                            onOpenPdf(url);
                        } else {
                            setViewingPdf({ url, filename: name });
                        }
                    }}
                />
            )}
            {viewingPdf && (
                <PdfViewerModal
                    viewingPdf={viewingPdf}
                    onClose={() => setViewingPdf(null)}
                />
            )}
            {playingAudioUrl && (() => {
                const isDrive = !!(playingAudioUrl && (playingAudioUrl.includes('drive.google.com') || playingAudioUrl.includes('drive.usercontent.google.com') || playingAudioUrl.includes('docs.google.com')));
                const getDriveEmbedSrc = (rawUrl) => {
                    if (!rawUrl) return '';
                    const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                        return `https://drive.google.com/file/d/${match[1]}/preview`;
                    }
                    const matchId = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                    if (matchId && matchId[1]) {
                        return `https://drive.google.com/file/d/${matchId[1]}/preview`;
                    }
                    return rawUrl;
                };

                return ReactDOM.createPortal(
                    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[10002] transition-all duration-300 animate-in slide-in-from-bottom-4 ${isDrive ? 'w-[95%] sm:w-[540px] max-w-xl' : 'w-[90%] max-w-md'}`}>
                        <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 flex flex-col gap-3 transition-all ${isDrive ? 'p-4 sm:p-5' : 'p-4'}`}>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                        <Volume2 size={18} className="text-white animate-pulse" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">Playing Audio Resource</span>
                                </div>
                                <button
                                    onClick={() => setPlayingAudioUrl(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all shrink-0 cursor-pointer"
                                    aria-label="Close audio player"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            {isDrive ? (
                                <div className="w-full h-44 sm:h-48 min-h-[160px] rounded-xl overflow-hidden bg-gray-50 border border-gray-200/60 shadow-inner">
                                    <iframe
                                        src={getDriveEmbedSrc(playingAudioUrl)}
                                        className="w-full h-full border-none"
                                        title="Google Drive Audio Player"
                                        allow="autoplay"
                                    />
                                </div>
                            ) : (
                                <div className="w-full">
                                    <audio
                                        key={playingAudioUrl}
                                        src={getAudioSrc(playingAudioUrl)}
                                        controls
                                        autoPlay
                                        className="w-full h-10 custom-audio-player"
                                    />
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                );
            })()}
            
            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .small-scroller::-webkit-scrollbar { width: 4px; height: 4px; }
                .small-scroller::-webkit-scrollbar-track { background: #f8fafc; border-radius: 9999px; }
                .small-scroller::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
                .small-scroller::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .small-scroller { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f8fafc; }
                .custom-scrollbar-thin::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}} />
        </div>
    );
};

export default LectureListTable;
