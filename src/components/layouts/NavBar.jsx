import React from "react";
import { CiBellOn } from "react-icons/ci";
import { Menu } from "lucide-react";
import Profilelogo from "../../assets/images/course2.png";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar({ onMenuClick }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLangOpen, setIsLangOpen] = React.useState(false);
    const [selectedLang, setSelectedLang] = React.useState("English");

    const languages = [
        { name: "English", code: "en", flag: "https://flagcdn.com/us.svg" },
        { name: "Urdu", code: "ur", flag: "https://flagcdn.com/pk.svg" },
        { name: "Arabic", code: "ar", flag: "https://flagcdn.com/sa.svg" },
    ];

    const today = new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    }).replace(/ /g, ', ');

    return (

        <div className="w-full h-auto md:min-h-[80px] py-4 md:py-0 flex items-center justify-center bg-gradient-to-r from-[#8B9CF1] to-[#B9A0EF] px-4 md:px-8 shadow-sm">
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
                            <div className="w-auto h-[14px] font-['Roboto'] font-Regular text-[11px] min-[500px]:text-[12px] leading-[100%] tracking-[5%] text-[#2C2C2C]">
                                {today}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-auto flex justify-end max-[500px]:gap-2 min-[500px]:justify-between items-center gap-4">
                    <div className="w-[20px] min-[430px]:w-[30px] min-[430px]:h-[30px] h-[20px] bg-gray-100/15 flex items-center justify-center rounded-[5px] shadow-sm">
                        <CiBellOn className="min-[430px]:text-[20px] text-[12px]" />
                    </div>
                    <div className="relative">
                        <div
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="bg-gray-100/15 flex items-center justify-center rounded-[6px] shadow-sm cursor-pointer hover:bg-white/20 transition-all p-1.5 sm:px-3 gap-2 border border-white/10"
                        >
                            <div className="flex items-center gap-2">
                                <img 
                                    src={languages.find(l => l.name === selectedLang)?.flag} 
                                    alt="" 
                                    className="w-[18px] h-auto rounded-[2px] shadow-sm"
                                />
                                <span className="text-[#2C2C2C] text-sm font-semibold hidden sm:inline">{selectedLang}</span>
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`w-3 h-3 text-[##2C2C2C] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </div>

                        {/* Dropdown Menu */}
                        {isLangOpen && (
                            <div className="absolute top-full mt-2 right-0 w-[140px] bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setSelectedLang(lang.name);
                                            setIsLangOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${selectedLang === lang.name ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700 font-medium'}`}
                                    >
                                        <img src={lang.flag} alt="" className="w-[18px] h-auto rounded-[2px] shadow-sm" />
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div 
                            onClick={() => user?.role === 'admin' ? navigate('/admin/profile') : navigate('/profile')}
                            className="w-[30px] min-[430px]:w-[42px] h-[30px] min-[430px]:h-[42px] rounded-full overflow-hidden border-2 border-white/20 shadow-sm bg-white/20 flex items-center justify-center cursor-pointer hover:border-white transition-all"
                        >
                            {user?.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[#2C2C2C] font-bold text-sm">{user?.firstname?.charAt(0) || user?.name?.charAt(0) || 'A'}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;