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

    const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    return (
        <div className="w-full h-auto md:min-h-[80px] py-3 md:py-0 flex items-center justify-center bg-gradient-to-r from-[#8B9CF1] to-[#B9A0EF] px-4 sm:px-6 md:px-8 shadow-sm">
            <div className="w-full flex flex-row justify-between items-center gap-2 sm:gap-4">
                <div className="flex flex-row items-center gap-2 sm:gap-4 flex-1">
                    <div className="flex items-center gap-1 sm:gap-3">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-1.5 hover:bg-white/20 rounded-md transition-colors text-[#2C2C2C]"
                        >
                            <Menu size={20} className="sm:w-6 sm:h-6" />
                        </button>
                        <div className="min-w-0">
                            <div className="font-['Roboto'] font-bold text-[16px] sm:text-[18px] min-[500px]:text-[22px] leading-tight tracking-tight text-[#2C2C2C] truncate">
                                Dashboard
                            </div>
                            <div className="font-['Roboto'] font-medium text-[10px] sm:text-[11px] min-[500px]:text-[12px] leading-tight text-[#2C2C2C]/80 truncate">
                                {today}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 px-2 sm:px-0">
                    <div className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] bg-white/10 flex items-center justify-center rounded-lg shadow-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                        <CiBellOn className="text-[16px] sm:text-[20px] text-[#2C2C2C]" />
                    </div>
                    
                    <div className="relative">
                        <div
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="bg-white/10 flex items-center justify-center rounded-lg shadow-sm cursor-pointer hover:bg-white/20 transition-all p-1.5 sm:px-3 gap-1.5 sm:gap-2 border border-white/10"
                        >
                            <img 
                                src={languages.find(l => l.name === selectedLang)?.flag} 
                                alt="" 
                                className="w-[16px] sm:w-[18px] h-auto rounded-[2px] shadow-sm"
                            />
                            <span className="text-[#2C2C2C] text-[12px] sm:text-sm font-bold hidden min-[400px]:inline">{selectedLang === "English" ? "EN" : selectedLang === "Urdu" ? "UR" : "AR"}</span>
                            <span className="text-[#2C2C2C] text-sm font-bold hidden sm:inline">{selectedLang}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`text-[#2C2C2C] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </div>

                        {isLangOpen && (
                            <div className="absolute top-full mt-2 right-0 w-[140px] bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setSelectedLang(lang.name);
                                            setIsLangOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${selectedLang === lang.name ? 'text-[#5D5FEF] font-bold bg-blue-50/50' : 'text-gray-700 font-medium'}`}
                                    >
                                        <img src={lang.flag} alt="" className="w-[18px] h-auto rounded-[2px] shadow-sm" />
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div 
                        onClick={() => user?.role === 'admin' ? navigate('/admin/profile') : navigate('/profile')}
                        className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] rounded-full overflow-hidden border-2 border-white/30 shadow-md bg-white/20 flex items-center justify-center cursor-pointer hover:border-white transition-all shrink-0"
                    >
                        {user?.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[#2C2C2C] font-black text-xs sm:text-sm">{user?.firstname?.charAt(0) || user?.name?.charAt(0) || 'A'}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;