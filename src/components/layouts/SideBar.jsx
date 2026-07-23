import { useEffect, useState } from 'react'; // Added useEffect
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import Sideabrbbutton from '../ui/buttons/Sideabrbbutton';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Added useLocation
import { useAuth } from '@/context/AuthContext';
import { logout as apiLogout } from '@/api/auth';
import LogoutModal from '@/components/shared/LogoutModal';

function Sidebar({ className, onClose }) {
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL (e.g., /profile)
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isReportsExpanded, setIsReportsExpanded] = useState(false);
  const [isStudentsExpanded, setIsStudentsExpanded] = useState(false);
  const [isModeratorsExpanded, setIsModeratorsExpanded] = useState(false);
  const { user, logout: contextLogout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { t } = useTranslation();

  const tKey = (str) => {
    const map = {
      'Dashboard': 'dashboard',
      'Calendar': 'calendar',
      'Notification': 'notification',
      'Moderators': 'moderators',
      'Student Profiles': 'student_profiles',
      'Courses Management': 'courses_management',
      'Reports & Logs': 'reports_logs',
      'My Courses': 'my_courses',
      'Certificates': 'certificates',
      'Profile': 'profile',
      'Notifications': 'notifications',
      'Help Center': 'help_center',
      'All Moderators': 'all_moderators',
      'Male Moderators': 'male_moderators',
      'Female Moderators': 'female_moderators',
      'All Students': 'all_students',
      'Male Students': 'male_students',
      'Female Students': 'female_students',
      'Student Reports': 'student_reports',
      'Moderator Reports': 'moderator_reports',
      'Course Reports': 'course_reports',
      'Logout': 'logout',
    };
    return map[str] || str;
  };

  // Define menu items based on role
  const adminItems = ['Dashboard', 'Calendar', 'Notification', 'Moderators', 'Student Profiles', 'Courses Management', 'Reports & Logs'];
  const studentItems = ['Dashboard', 'My Courses', 'Certificates', 'Profile', 'Notifications', 'Help Center'];

  // Determine which items to show based on the active path/context, not strictly user role
  const isAdminRoute = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/reports') ||
    location.pathname.startsWith('/moderator-reports') ||
    location.pathname.startsWith('/course-reports') ||
    location.pathname.startsWith('/student-profiles') ||
    location.pathname.startsWith('/moderator-details') ||
    location.pathname.startsWith('/registered-users') ||
    location.pathname.startsWith('/registered-courses');

  // ONLY FULL ADMIN gets the adminItems main list. Moderators keep the student list.
  let menuItems = (isAdminRoute && user?.role === 'admin') ? adminItems : studentItems;
  let moderatorFeatures = [];

  // Display moderator features below the student items seamlessly across all views
  if (user?.role === 'moderator' && user?.assignedFeatures?.length > 0) {
    moderatorFeatures = user.assignedFeatures.filter(feature => !studentItems.includes(feature));
  }

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
    '/admin-moderators': 'Moderators',
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

    // Auth
    '/logout': 'Logout'
  };

  useEffect(() => {
    let currentName = pathToName[location.pathname];
    if (!currentName) {
      const matchedKey = Object.keys(pathToName).find(key =>
        location.pathname.startsWith(key) && key !== '/'
      );
      if (matchedKey) {
        currentName = pathToName[matchedKey];
      }
    }

    if (currentName) {
      setActiveItem(currentName);
      if (['Student Reports', 'Moderator Reports', 'Course Reports'].includes(currentName) || currentName === 'Reports & Logs') {
        setIsReportsExpanded(true);
      }
      if (['All Students', 'Male Students', 'Female Students'].includes(currentName) || currentName === 'Student Profiles') {
        setIsStudentsExpanded(true);
      }
      if (['All Moderators', 'Male Moderators', 'Female Moderators'].includes(currentName) || currentName === 'Moderators') {
        setIsModeratorsExpanded(true);
      }
    }
  }, [location.pathname]);

  const logout = async () => {
    try {
      console.log("Logout function called");
      await apiLogout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      contextLogout();
      navigate('/login');
    }
  };

  const handleItemClick = (itemName) => {
    if (itemName === 'Reports & Logs') {
      setIsReportsExpanded(!isReportsExpanded);
      return;
    }
    if (itemName === 'Student Profiles') {
      if (user?.role === 'moderator') {
        setActiveItem('Student Profiles');
        navigate('/student-profiles');
        if (onClose) onClose();
        return;
      }
      setIsStudentsExpanded(!isStudentsExpanded);
      return;
    }

    if (itemName === 'Moderators') {
      setIsModeratorsExpanded(!isModeratorsExpanded);
      return;
    }

    setActiveItem(itemName);

    if (itemName === 'Logout') {
      setIsLogoutModalOpen(true);
      return;
    }

    if (itemName === 'Dashboard') {
      if (user?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
      if (onClose) onClose();
      return;
    }

    if (itemName === 'Courses Management' || itemName === 'Courses') {
      if (user?.role === 'admin' || user?.role === 'moderator') {
        navigate('/admin-courses');
        if (onClose) onClose();
        return;
      }
    }

    if (['Student Reports', 'Moderator Reports', 'Course Reports'].includes(itemName)) {
      // It handles the sub-items for reports
      const subRoutes = {
        'Student Reports': '/reports',
        'Moderator Reports': '/moderator-reports',
        'Course Reports': '/course-reports'
      };
      navigate(subRoutes[itemName]);
      if (onClose) onClose();
      return;
    }

    if (['All Students', 'Male Students', 'Female Students'].includes(itemName)) {
      const subRoutes = {
        'All Students': '/student-profiles/all',
        'Male Students': '/student-profiles/male',
        'Female Students': '/student-profiles/female'
      };
      navigate(subRoutes[itemName]);
      if (onClose) onClose();
      return;
    }

    if (['All Moderators', 'Male Moderators', 'Female Moderators'].includes(itemName)) {
      const subRoutes = {
        'All Moderators': '/admin-moderators/all',
        'Male Moderators': '/admin-moderators/male',
        'Female Moderators': '/admin-moderators/female'
      };
      navigate(subRoutes[itemName]);
      if (onClose) onClose();
      return;
    }

    const path = Object.keys(pathToName).find(key => pathToName[key] === itemName);
    if (path) {
      navigate(path);
    }

    if (onClose) onClose();
  };

  const renderMenuItem = (item) => {
    if (item === 'Reports & Logs') {
      const isAnyReportActive = ['Student Reports', 'Moderator Reports', 'Course Reports'].includes(activeItem);
      return (
        <div key={item} className="w-full flex flex-col gap-1">
          <Sideabrbbutton
            isActive={isAnyReportActive}
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(item);
            }}
          >
            <div className="flex items-center justify-between w-full pr-2">
              <span>{t(tKey(item), item)}</span>
              {isReportsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </Sideabrbbutton>
          {isReportsExpanded && (
            <div className="flex flex-col gap-1 ml-4 border-l-2 border-[#E5E7EB] pl-2 transition-all">
              <button
                onClick={() => handleItemClick('Student Reports')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#6A6F78] hover:text-[#4B4F56] ${activeItem === 'Student Reports' ? 'font-bold' : 'font-medium'}`}
              >
                <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#6A6F78]"></span>
                {t('student_reports', 'Student Reports')}
              </button>
              <button
                onClick={() => handleItemClick('Moderator Reports')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#3758EE] hover:text-[#2540B3] ${activeItem === 'Moderator Reports' ? 'font-bold' : 'font-medium'}`}
              >
                <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#3758EE]"></span>
                {t('moderator_reports', 'Moderator Reports')}
              </button>
              <button
                onClick={() => handleItemClick('Course Reports')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#A269FF] hover:text-[#7C3AED] ${activeItem === 'Course Reports' ? 'font-bold' : 'font-medium'}`}
              >
                <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#A269FF]"></span>
                {t('course_reports', 'Course Reports')}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (item === 'Moderators') {
      const isAnyModeratorActive = ['All Moderators', 'Male Moderators', 'Female Moderators', 'Moderators'].includes(activeItem);
      return (
        <div key={item} className="w-full flex flex-col gap-1">
          <Sideabrbbutton
            isActive={isAnyModeratorActive}
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(item);
            }}
          >
            <div className="flex items-center justify-between w-full pr-2">
              <span>{t(tKey(item), item)}</span>
              {isModeratorsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </Sideabrbbutton>
          {isModeratorsExpanded && (
            <div className="flex flex-col gap-1 ml-4 border-l-2 border-[#E5E7EB] pl-2 transition-all">
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => handleItemClick('All Moderators')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#6A6F78] hover:text-[#4B4F56] ${activeItem === 'All Moderators' ? 'font-bold' : 'font-medium'}`}
                  >
                    <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#6A6F78]"></span>
                    {t('all_moderators', 'All Moderators')}
                  </button>
                  <button
                    onClick={() => handleItemClick('Male Moderators')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#3758EE] hover:text-[#2540B3] ${activeItem === 'Male Moderators' ? 'font-bold' : 'font-medium'}`}
                  >
                    <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#3758EE]"></span>
                    {t('male_moderators', 'Male Moderators')}
                  </button>
                  <button
                    onClick={() => handleItemClick('Female Moderators')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#A269FF] hover:text-[#7C3AED] ${activeItem === 'Female Moderators' ? 'font-bold' : 'font-medium'}`}
                  >
                    <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#A269FF]"></span>
                    {t('female_moderators', 'Female Moderators')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    if (item === 'Student Profiles') {
      if (user?.role === 'moderator') {
        const isAnyStudentActive = ['All Students', 'Male Students', 'Female Students', 'Student Profiles'].includes(activeItem);
        return (
          <Sideabrbbutton
            key={item}
            isActive={isAnyStudentActive}
            onClick={(e) => {
              e.preventDefault();
              handleItemClick('Student Profiles');
            }}
          >
            {t('student_profiles', 'Student Profiles')}
          </Sideabrbbutton>
        );
      }

      const isAnyStudentActive = ['All Students', 'Male Students', 'Female Students', 'Student Profiles'].includes(activeItem);
      return (
        <div key={item} className="w-full flex flex-col gap-1">
          <Sideabrbbutton
            isActive={isAnyStudentActive}
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(item);
            }}
          >
            <div className="flex items-center justify-between w-full pr-2">
              <span>{t(tKey(item), item)}</span>
              {isStudentsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </Sideabrbbutton>
          {isStudentsExpanded && (
            <div className="flex flex-col gap-1 ml-4 border-l-2 border-[#E5E7EB] pl-2 transition-all">
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => handleItemClick('All Students')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#6A6F78] hover:text-[#4B4F56] ${activeItem === 'All Students' ? 'font-bold' : 'font-medium'}`}
                  >
                    <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#6A6F78]"></span>
                    {t('all_students', 'All Students')}
                  </button>
                  <button
                    onClick={() => handleItemClick('Male Students')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#3758EE] hover:text-[#2540B3] ${activeItem === 'Male Students' ? 'font-bold' : 'font-medium'}`}
                  >
                    <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#3758EE]"></span>
                    {t('male_students', 'Male Students')}
                  </button>
                  <button
                    onClick={() => handleItemClick('Female Students')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-[14px] cursor-pointer transition-colors text-[#A269FF] hover:text-[#7C3AED] ${activeItem === 'Female Students' ? 'font-bold' : 'font-medium'}`}
                  >
                    <span className="w-[8px] h-[8px] rounded-full shrink-0 bg-[#A269FF]"></span>
                    {t('female_students', 'Female Students')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      );
    }
    return (
      <Sideabrbbutton
        key={item}
        isActive={activeItem === item}
        onClick={() => handleItemClick(item)}
      >
        {t(tKey(item), item)}
      </Sideabrbbutton>
    );
  };

  return (
    <div className={`w-[260px] bg-white border-r-[3px] lg:border-[3px] border-[#6984E6] flex flex-col z-40 lg:rounded shadow-sm h-screen lg:h-[calc(100vh-120px)] overflow-hidden ${className}`}>
      {/* Header */}
      <div className='w-full flex items-center justify-between px-4 pt-6 mb-6 h-[44px] shrink-0'>
        <div className='text-[#6A6F78] text-[14px] ml-3 font-medium pr-2 pb-1'>{t('welcome_user', 'Welcome, ')} {t(user?.firstname || user?.name || "User")}</div>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className='w-full lg:w-[192px] mx-auto px-4 lg:px-0 flex-1 overflow-y-auto overflow-x-hidden custom-sidebar-scrollbar min-h-0 pr-1 pb-4 flex flex-col gap-2 text-[14px] text-[#6A6F78] font-[500] max-h-[65vh] lg:max-h-[70vh]'>
        <div className='w-full flex flex-col items-start gap-2'>
          {menuItems.map(renderMenuItem)}
        </div>

        {moderatorFeatures.length > 0 && (
          <div className='w-full flex flex-col items-start gap-2 mt-4 pt-4 border-t border-gray-100'>
            <div className='uppercase text-[10px] font-bold text-[#A0AEC0] tracking-wider mb-1 pl-3'>{t('moderator_features', 'Moderator Features')}</div>
            {moderatorFeatures.map(renderMenuItem)}
          </div>
        )}
      </div>

      {/* Footer (Logout) fixed to bottom */}
      <div className='w-full lg:w-[192px] mx-auto px-4 lg:px-0 flex flex-col items-start gap-2 text-[14px] text-[#6A6F78] font-[500] border-t border-gray-100 pt-2 shrink-0 pb-10'>
        <Sideabrbbutton
          isActive={activeItem === 'Logout'}
          onClick={() => handleItemClick('Logout')}
        >
          {t('logout', 'Logout')}
        </Sideabrbbutton>
      </div>


      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-sidebar-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .custom-sidebar-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }
        `
      }} />
    </div>
  );
}

export default Sidebar;