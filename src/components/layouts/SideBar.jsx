import { useEffect, useState } from 'react'; // Added useEffect
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import Sideabrbbutton from '../ui/buttons/Sideabrbbutton';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '@/context/AuthContext';
import { logout as apiLogout } from '@/api/auth';

function Sidebar({ className, onClose }) {
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL (e.g., /profile)
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isReportsExpanded, setIsReportsExpanded] = useState(false);
  const { user, logout: contextLogout } = useAuth();

  // Define menu items based on role
  const adminItems = ['Dashboard', 'Calendar', 'Notification', 'Moderators', 'Student Profiles', 'Courses', 'Reports & Logs'];
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
  // location.pathname.startsWith('/reports') ||
  // location.pathname.startsWith('/moderator-reports') ||
  // location.pathname.startsWith('/course-reports') ||
  // location.pathname.startsWith('/student-profiles') ||
  // location.pathname.startsWith('/moderator-details');

  // location.pathname.startsWith('/registered-users') ||   
  // location.pathname.startsWith('/registered-courses');

  let menuItems = isAdminRoute ? adminItems : studentItems;
  let moderatorFeatures = [];

  if (!isAdminRoute && user?.role === 'moderator' && user?.assignedFeatures?.length > 0) {
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
    '/moderator-details': 'Moderators',
    '/student-profiles': 'Student Profiles',
    '/admin-courses': 'Courses',
    '/reports': 'Student Reports',
    '/moderator-reports': 'Moderator Reports',
    '/course-reports': 'Course Reports',

    '/admin/student-details': 'Student Profiles',
    '/admin/moderator-details': 'Moderators',
    '/admin/profile': 'Dashboard',
    '/admin/course-details': 'Courses',
    '/admin-course-view': 'Courses',
    '/admin-course-play': 'Courses',
    '/admin-course-add': 'Courses',
    '/admin-add-course': 'Courses',
    '/registered-users': 'Student Profiles',
    '/registered-courses': 'Courses',

    // Auth
    '/logout': 'Logout'
  };

  useEffect(() => {
    // Try exact match first
    let currentName = pathToName[location.pathname];

    // If no exact match, try prefix matching for dynamic routes like /admin/student-details/1
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
      if (['Student Reports', 'Moderator Reports', 'Course Reports'].includes(currentName)) {
        setIsReportsExpanded(true);
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

    setActiveItem(itemName);

    if (itemName === 'Logout') {
      logout();
      if (onClose) onClose();
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

    if (itemName === 'Courses' && user?.role === 'admin') {
      navigate('/admin-courses');
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
              <span>{item}</span>
              {isReportsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </Sideabrbbutton>
          {isReportsExpanded && (
            <div className="flex flex-col gap-1 ml-4 border-l-2 border-[#E5E7EB] pl-2 transition-all">
              <Sideabrbbutton isActive={activeItem === 'Student Reports'} onClick={() => handleItemClick('Student Reports')}>
                Student Reports
              </Sideabrbbutton>
              <Sideabrbbutton isActive={activeItem === 'Moderator Reports'} onClick={() => handleItemClick('Moderator Reports')}>
                Moderator Reports
              </Sideabrbbutton>
              <Sideabrbbutton isActive={activeItem === 'Course Reports'} onClick={() => handleItemClick('Course Reports')}>
                Course Reports
              </Sideabrbbutton>
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
        {item}
      </Sideabrbbutton>
    );
  };

  return (
    <div className={`w-[260px] bg-white p-4 pt-6 border-[3px] border-[#6984E6] flex flex-col z-40 rounded shadow-sm h-full ${className}`}>
      {/* Header */}
      <div className='w-full flex items-center justify-between mb-6 h-[44px] shrink-0'>
        <div className='text-[#6A6F78] text-[14px] ml-3 font-medium truncate pr-2'>Welcome, {user?.firstname || user?.name || "User"}</div>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Container */}
      <div className='w-full lg:w-[192px] mx-auto flex-1 overflow-y-auto custom-sidebar-scrollbar min-h-0 pr-1 pb-4 flex flex-col gap-2 text-[14px] text-[#6A6F78] font-[500]'>

        <div className='w-full flex flex-col items-start gap-2'>
          {menuItems.map(renderMenuItem)}
        </div>

        {moderatorFeatures.length > 0 && (
          <div className='w-full flex flex-col items-start gap-2 mt-4 pt-4 border-t border-gray-100'>
            <div className='uppercase text-[10px] font-bold text-[#A0AEC0] tracking-wider mb-1 pl-3'>Moderator Features</div>
            {moderatorFeatures.map(renderMenuItem)}
          </div>
        )}

      </div>

      {/* Footer (Logout) remains fixed at bottom */}
      <div className='w-full lg:w-[192px] mx-auto flex flex-col items-start gap-2 text-[14px] text-[#6A6F78] font-[500] border-t border-gray-100 pt-4 mt-2 shrink-0 pb-2'>
        <div className='uppercase text-[10px] font-bold text-gray-400 pl-3'>{isAdminRoute ? 'Admin' : 'User'}</div>
        <Sideabrbbutton
          isActive={activeItem === 'Logout'}
          onClick={() => handleItemClick('Logout')}
        >
          Logout
        </Sideabrbbutton>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-sidebar-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
           .custom-sidebar-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
            background: transparent;
            border-radius: 10px;
          }
          .custom-sidebar-scrollbar:hover::-webkit-scrollbar-thumb {
            background: #cbd5e1;
          }
        `
      }} />
    </div>
  );
}

export default Sidebar;