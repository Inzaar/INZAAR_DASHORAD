import React from "react";
import { CiBellOn } from "react-icons/ci";
import { Menu, User, LogOut } from "lucide-react";
import Profilelogo from "../../assets/images/course2.png";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Navbar({ onMenuClick, hideMenu = false, title }) {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const { i18n, t } = useTranslation();
    const [isLangOpen, setIsLangOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const profileDropdownRef = React.useRef(null);
    const langDropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { name: "English", code: "en", flag: "https://flagcdn.com/us.svg", dir: "ltr" },
        { name: "Urdu", code: "ur", flag: "https://flagcdn.com/pk.svg", dir: "rtl" },
        { name: "Arabic", code: "ar", flag: "https://flagcdn.com/sa.svg", dir: "rtl" },
    ];

    const currentLangCode = (i18n.language || 'en').split('-')[0];
    const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang.code);
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.code;
        setIsLangOpen(false);

        // Magic: Trigger hidden Google Translate widget
        const gtSelect = document.querySelector('.goog-te-combo');
        if (gtSelect) {
            gtSelect.value = lang.code;
            gtSelect.dispatchEvent(new Event('change'));
        }
    };

    const today = new Intl.DateTimeFormat(i18n.language || 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    // Map your URL paths to the Display Names
    const pathToName = {
        // Student Paths
        '/dashboard': 'Dashboard',
        '/enrolled-courses': 'My Courses',
        '/courses': 'My Courses',
        '/course-view': "My Courses",
        '/notifications': 'Notifications',
        '/certificates': 'Certificates',
        '/profile': 'Profile',
        '/help-center': 'Help Center',

        // Admin Paths
        '/admin-dashboard': 'Dashboard',
        '/admin-calendar': 'Calendar',
        '/admin-notifications': 'Notification',
        '/admin-moderators': 'All Moderators',
        '/admin-moderators/all': 'All Moderators',
        '/admin-moderators/male': 'Male Moderators',
        '/admin-moderators/female': 'Female Moderators',
        '/moderator-details': 'Moderators',
        '/student-profiles': 'Student Profiles',
        '/student-profiles/all': 'All Students',
        '/student-profiles/male': 'Male Students',
        '/student-profiles/female': 'Female Students',
        '/admin-courses': 'Courses Management',
        '/reports': 'Student Reports',
        '/moderator-reports': 'Moderator Reports',
        '/course-reports': 'Course Reports',
        '/export-student-reports': 'Export Student Reports',
        '/export-moderator-reports': 'Export Moderator Reports',

        '/admin/student-details': 'Student Profiles',
        '/admin/moderator-details': 'Moderators',
        '/admin/profile': 'Dashboard',
        '/admin/course-details': 'Courses Management',
        '/admin-course-view': 'Courses Management',
        '/admin-course-play': 'Courses Management',
        '/admin-course-add': 'Courses Management',
        '/admin-add-course': 'Courses Management',
        '/registered-users': 'Student Profiles',
        '/registered-courses': 'Courses Management',
        '/admin-volunteers': 'Volunteers',

        // Auth
        '/logout': 'Logout'
    };

    let computedTitle = title;
    if (!computedTitle) {
        let currentName = pathToName[location.pathname];
        if (!currentName) {
            const matchedKey = Object.keys(pathToName).find(key =>
                location.pathname.startsWith(key) && key !== '/'
            );
            if (matchedKey) {
                currentName = pathToName[matchedKey];
            }
        }
        computedTitle = currentName || 'Dashboard';
    }

    return (
        <div className="relative w-full h-auto md:min-h-[80px] py-2 sm:py-3 md:py-0 flex items-center justify-center shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-2.5 sm:px-6 md:px-8">
            {/* Base Gradient Layer (Left to Right) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B9CF1] to-[#B9A0EF]"></div>
            
            {/* Minimal White Shadow Overlay (Top to Bottom) */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none"></div>

            {/* Navbar Content */}
            <div className="relative z-10 w-full flex flex-row justify-between items-center gap-1.5 sm:gap-4">
                <div className="flex flex-row items-center gap-1.5 sm:gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-3 min-w-0">
                        {!hideMenu && (
                            <button
                                onClick={onMenuClick}
                                className="lg:hidden p-1 sm:p-1.5 hover:bg-white/20 rounded-md transition-colors text-[#2C2C2C] shrink-0"
                            >
                                <Menu size={20} className="sm:w-6 sm:h-6" />
                            </button>
                        )}
                        <div className="min-w-0 flex flex-col justify-center">
                            <div className="font-['Roboto'] font-bold text-[14px] min-[380px]:text-[16px] sm:text-[18px] min-[500px]:text-[22px] leading-tight tracking-tight text-[#2C2C2C] truncate">
                                {t((computedTitle).toLowerCase().replace(/ /g, '_'), computedTitle)}
                            </div>
                            <div className="font-['Roboto'] font-medium text-[9px] min-[380px]:text-[10px] sm:text-[11px] min-[500px]:text-[12px] leading-tight text-[#2C2C2C]/80 mt-0.5 truncate">
                                {today}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 px-0 sm:px-0">
                    <div
                        onClick={() => user?.role === 'admin' ? navigate('/admin-notifications') : navigate('/notifications')}
                        className="relative w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] bg-white/10 flex items-center justify-center rounded-lg shadow-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer"
                    >
                        <CiBellOn className="text-[16px] sm:text-[20px] text-[#2C2C2C]" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-[#FF4D4D] to-[#FF0000] text-white text-[9px] sm:text-[10px] font-black min-w-[16px] sm:min-w-[22px] h-[16px] sm:h-[22px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-md z-10 transition-all">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    <div className="relative" ref={langDropdownRef}>
                        <div
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="bg-white/10 flex items-center justify-center rounded-lg shadow-sm cursor-pointer hover:bg-white/20 transition-all p-1 sm:p-1.5 sm:px-3 gap-1 sm:gap-2 border border-white/10"
                        >
                            <img
                                src={currentLang.flag}
                                alt=""
                                className="w-[15px] sm:w-[18px] h-auto rounded-[2px] shadow-sm shrink-0"
                            />
                            <span className="text-[#2C2C2C] text-[11px] sm:text-sm font-bold hidden min-[400px]:inline">{currentLang.code.toUpperCase()}</span>
                            <span className="text-[#2C2C2C] text-sm font-bold hidden sm:inline">{t(currentLang.name.toLowerCase(), currentLang.name)}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`text-[#2C2C2C] transition-transform duration-200 shrink-0 ${isLangOpen ? 'rotate-180' : ''}`}
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </div>

                        {isLangOpen && (
                            <div className="absolute top-full mt-2.5 right-0 w-[125px] sm:w-[140px] bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="absolute -top-1.5 right-3 w-2.5 h-2.5 bg-white border-t border-l border-gray-100 rotate-45"></div>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang)}
                                        className={`w-full text-left px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors flex items-center gap-2.5 sm:gap-3 rounded-lg relative z-10 ${currentLang.code === lang.code ? 'text-[#5D5FEF] font-bold bg-blue-50/50' : 'text-gray-700 font-medium'}`}
                                    >
                                        <img src={lang.flag} alt="" className="w-[16px] sm:w-[18px] h-auto rounded-[2px] shadow-sm" />
                                        {t(lang.name.toLowerCase(), lang.name)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={profileDropdownRef}>
                        <div
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] rounded-full overflow-hidden border-[2.5px] sm:border-[3.5px] border-white shadow-lg bg-white/20 flex items-center justify-center cursor-pointer hover:scale-105 transition-all shrink-0"
                        >
                            {user?.profileImageUrl && user.profileImageUrl.trim() !== '' ? (
                                <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[#2C2C2C] font-black text-xs sm:text-sm">{user?.firstname?.charAt(0) || user?.name?.charAt(0) || 'A'}</span>
                            )}
                        </div>

                        {isProfileOpen && (
                            <div className="absolute top-full mt-2.5 right-0 w-[195px] min-[380px]:w-[215px] sm:w-[240px] bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-1.5 sm:p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {/* Top Pointer Notch */}
                                <div className="absolute -top-1.5 right-3.5 sm:right-4 w-2.5 h-2.5 bg-white border-t border-l border-gray-100 rotate-45"></div>

                                {/* User Header */}
                                <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 border-b border-gray-100 flex items-center gap-2.5 sm:gap-3 relative z-10 bg-white rounded-t-lg">
                                    <div className="w-[30px] h-[30px] sm:w-[38px] sm:h-[38px] rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                                        {user?.profileImageUrl && user.profileImageUrl.trim() !== '' ? (
                                            <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-600 font-bold text-xs sm:text-sm">{user?.firstname?.charAt(0) || user?.name?.charAt(0) || 'A'}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-tight">
                                            {user?.firstname || user?.name || "User"} {user?.lastname || ""}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-gray-500 truncate leading-tight mt-0.5" title={user?.email}>
                                            {user?.email || ""}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-1 flex flex-col gap-0.5 relative z-10">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            user?.role === 'admin' ? navigate('/admin/profile') : navigate('/profile');
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5D5FEF] transition-colors font-medium flex items-center gap-2 sm:gap-2.5 rounded-lg"
                                    >
                                        <User size={14} className="text-gray-400 shrink-0 sm:w-4 sm:h-4" />
                                        <span>{t('profile', 'Profile')}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            if (logout) logout();
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2 sm:gap-2.5 rounded-lg"
                                    >
                                        <LogOut size={14} className="text-red-500 shrink-0 sm:w-4 sm:h-4" />
                                        <span>{t('logout', 'Logout')}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;