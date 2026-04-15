import React, { useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Plus, Minus } from 'lucide-react';

const HelpCenter = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('contact');
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    const faqs = [
        {
            question: "Why is the next lecture locked?",
            answer: "The next lecture unlocks only after you watch at least 70% of the current lecture. This helps ensure proper understanding before moving forward."
        },
        {
            question: "When will my course certificate be available?",
            answer: "Certificates are automatically generated and available for download once you have completed 100% of the course content and passed all required assessments."
        },
        {
            question: "When will my course certificate be available?",
            answer: "Certificates are automatically generated and available for download once you have completed 100% of the course content and passed all required assessments."
        },
        {
            question: "Can I enroll in more than one course at the same time?",
            answer: "Yes, you can enroll in multiple courses simultaneously. Your progress for each course is tracked independently."
        }
    ];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                        transition-transform duration-300 ease-in-out z-40
                        lg:translate-x-0 lg:static lg:block
                        fixed left-0 top-0 shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="py-4 pr-2 flex flex-col gap-6">

                            {/* Header Section */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Support Center</h2>
                                <p className="text-gray-500 text-sm">Find answers, report issues, and get in touch with our team to help you make the most of Inzaar Team.</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex bg-white rounded-lg p-1 w-full border border-gray-100 shadow-sm">
                                {activeTab === 'contact' ? (
                                    <GradiantButton
                                        onClick={() => setActiveTab('contact')}
                                        className="flex-1 py-4 text-sm font-medium rounded-md shadow-sm"
                                    >
                                        Contact Support
                                    </GradiantButton>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab('contact')}
                                        className="flex-1 py-4 text-sm font-medium rounded-md transition-all text-gray-500 hover:bg-gray-50"
                                    >
                                        Contact Support
                                    </button>
                                )}

                                {activeTab === 'faq' ? (
                                    <GradiantButton
                                        onClick={() => setActiveTab('faq')}
                                        className="flex-1 py-4 text-sm font-medium rounded-md shadow-sm"
                                    >
                                        Helps & FAQ
                                    </GradiantButton>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab('faq')}
                                        className="flex-1 py-4 text-sm font-medium rounded-md transition-all text-gray-500 hover:bg-gray-50"
                                    >
                                        Helps & FAQ
                                    </button>
                                )}
                            </div>

                            {/* Content Section */}
                            {activeTab === 'contact' && (
                                <div className="animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">support@email.com</h3>

                                    <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-8 shadow-sm">
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Contact Support</h3>
                                            <p className="text-gray-500 text-sm">Fill out the form below to get in touch with our support team.</p>
                                        </div>

                                        <form className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Name</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Ruben Herwitz"
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Email</label>
                                                <input
                                                    type="email"
                                                    defaultValue="rubenherwitz@gmail.com"
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Issue / Question</label>
                                                <textarea
                                                    placeholder="Discuss your issue or question here..."
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 min-h-[160px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                                />
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <GradiantButton className="px-10 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-purple-500/20">
                                                    Submit
                                                </GradiantButton>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'faq' && (
                                <div className="animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Helps & FAQs</h3>

                                    <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-8 shadow-sm">
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Helps & FAQs</h3>
                                            <p className="text-gray-500 text-sm">Find answers to common questions and helpful tips to get started quickly.</p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {faqs.map((faq, index) => (
                                                <div
                                                    key={index}
                                                    className={`rounded-lg transition-all duration-200 ${openFaqIndex === index ? 'bg-gray-50 p-4' : 'bg-transparent py-3 border-b border-gray-50 last:border-0'
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                                                        className="w-full flex items-center justify-between gap-4 text-left"
                                                    >
                                                        <span className={`font-medium text-sm ${openFaqIndex === index ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {faq.question}
                                                        </span>
                                                        <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-colors ${openFaqIndex === index ? 'text-[#00C896] bg-[#E6F9F4]' : 'text-gray-400 bg-gray-100'
                                                            }`}>
                                                            {openFaqIndex === index ? <Plus className="h-4 w-4 rotate-45 transition-transform" /> : <Minus className="h-4 w-4" />}
                                                        </span>
                                                    </button>

                                                    {openFaqIndex === index && (
                                                        <div className="mt-3 text-sm text-gray-500 leading-relaxed pr-8 animate-in slide-in-from-top-1 duration-200">
                                                            {faq.answer}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />
            </div>
        </div>
    );
};

export default HelpCenter;
