import React from "react";
import { CiBellOn } from "react-icons/ci";
import { Menu } from "lucide-react";
import Profilelogo from "../../assets/images/course2.png";

function Navbar({ onMenuClick }) {
    const [isLangOpen, setIsLangOpen] = React.useState(false);
    const [selectedLang, setSelectedLang] = React.useState("English");

    const languages = [
        { name: "English", code: "en" },
        { name: "Urdu", code: "ur" },
        { name: "Arabic", code: "ar" },
    ];

    return (

        <div className="w-full h-auto md:min-h-[80px] py-4 md:py-0 flex items-center justify-center bg-gradient-to-r from-[#8B9CF1] to-[#B9A0EF] px-4 md:px-8">
            <div className="w-full flex flex-row justify-between items-center gap-4 md:gap-0">
                <div className="flex flex-row items-center gap-1 md:gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-1 hover:bg-white/20 rounded-md transition-colors text-[#2C2C2C]"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <div className="font-['Roboto'] font-semibold text-[18px] min-[500px]:text-[22px] leading-[100%] tracking-[0.05em] text-[#2C2C2C] ">
                                Dashboard
                            </div>
                            <div className="w-[153px] h-[14px] font-['Roboto'] font-Regular text-[11px] min-[500px]:text-[12px] leading-[100%] tracking-[5%] text-[#2C2C2C]">
                                Tuesday,January 27 2025
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-[218px] h-[42px] flex justify-end max-[500px]:gap-2 min-[500px]:justify-between items-center">
                    <div className="w-[20px] min-[430px]:w-[30px] min-[430px]:h-[30px] h-[20px] bg-gray-100/15 flex items-center justify-center rounded-[5px] shadow-sm">
                        <CiBellOn className="min-[430px]:text-[20px] text-[12px]" />
                    </div>
                    <div className="relative">
                        <div
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="w-[60px] min-[500px]:w-[98px] min-[430px]:h-[30px] h-[20px] max-[500px]:text-[11px] bg-gray-100/15 flex items-center justify-center rounded-[5px] shadow-sm cursor-pointer hover:bg-white/20 transition-colors"
                        >
                            <span className="text-[#2C2C2C]">{selectedLang}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`ml-1 w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </div>

                        {/* Dropdown Menu */}
                        {isLangOpen && (
                            <div className="absolute top-full mt-1 right-0 w-[120px] bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setSelectedLang(lang.name);
                                            setIsLangOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedLang === lang.name ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'}`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div><img src={Profilelogo} alt="profile" className="min-[430px]:w-[42px] min-[430px]:h-[42px] w-[30px] h-[30px] rounded-full object-cover" /></div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;