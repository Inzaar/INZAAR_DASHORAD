import { useEffect, useState } from 'react'; // Added useEffect
import { X } from 'lucide-react';
import Sideabrbbutton from '../ui/buttons/Sideabrbbutton';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '@/context/AuthContext';
import { logout as apiLogout } from '@/api/auth';

function Sidebar({ className, onClose }) {
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL (e.g., /profile)
  const [activeItem, setActiveItem] = useState('Dashboard');
  const { user, logout: contextLogout } = useAuth();

  // Define menu items based on role
  const adminItems = ['Dashboard', 'Calendar', 'Notification', 'Moderators', 'Student Profiles', 'Courses', 'Reports & Logs'];
  const studentItems = ['Dashboard', 'My Courses', 'Certificates', 'Profile', 'Notifications', 'Help Center'];

  // Determine which items to show
  const menuItems = user?.role === 'admin' ? adminItems : studentItems;

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
    '/moderators': 'Moderators',
    '/student-profiles': 'Student Profiles',
    '/admin-courses': 'Courses',
    '/reports': 'Reports & Logs',

    // Auth
    '/logout': 'Logout'
  };

  // Sync state with URL whenever the route changes
  useEffect(() => {
    const currentName = pathToName[location.pathname];
    if (currentName) {
      setActiveItem(currentName);
    }
  }, [location.pathname]);

  const logout = async () => {
    try {
      console.log("Logout function called");
      // Call backend API to invalidate session/cookie
      await apiLogout();
    } catch (error) {
      console.error("Logout API failed:", error);
      // Even if API fails, we should logout locally
    } finally {
      // Clear local auth state
      contextLogout();
      // Redirect to login page
      navigate('/login');
    }
  };

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);

    if (itemName === 'Logout') {
      logout();
      if (onClose) onClose();
      return;
    }

    // Special case for admin dashboard vs student dashboard as they share the name "Dashboard"
    if (itemName === 'Dashboard') {
      if (user?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
      if (onClose) onClose();
      return;
    }

    // Special case for "Courses" collision if you want distinct paths for admin vs student
    if (itemName === 'Courses' && user?.role === 'admin') {
      navigate('/admin-courses');
      if (onClose) onClose();
      return;
    }

    // Find the path associated with the clicked name
    const path = Object.keys(pathToName).find(key => pathToName[key] === itemName);

    if (path) {
      navigate(path);
    } else {
      // Fallback for unconnected admin routes
      console.log(`Navigating to placeholder for ${itemName}`);
      // You might want to navigate to a "Coming Soon" or specific route construction
      // navigate(`/admin/${itemName.toLowerCase().replace(/ /g, '-')}`); 
    }

    if (onClose) onClose();
  };

  return (
    <div className={`w-[260px] bg-white p-4 border-[3px] border-[#6984E6] flex flex-col z-40 rounded shadow-sm ${className}`}>
      <div className='w-full flex items-center justify-between mb-6 lg:mb-0 h-[44px]'>
        <div className='text-[#6A6F78] text-[14px] ml-3'>Welcome, {user?.firstname || user?.name || "User"}</div>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className='w-[192px] flex flex-col gap-[10px] mx-auto'>
        <div className='w-full flex flex-col items-start gap-2 text-[14px] text-[#6A6F78] font-[500]'>
          {/* <div className='mt-2 mb-2 uppercase text-xs font-bold text-gray-400'>Main Menu</div> */}
          {menuItems.map((item) => (
            <Sideabrbbutton
              key={item}
              isActive={activeItem === item} // This now stays blue based on the user selection
              onClick={() => handleItemClick(item)}
            >
              {item}
            </Sideabrbbutton>
          ))}
        </div>

        <div className='w-full flex flex-col items-start gap-2 text-[14px] text-[#6A6F78] font-[500] border-t border-gray-100 pt-4 mt-auto'>
          <div className='mt-2 uppercase text-xs font-bold text-gray-400'>User</div>
          <Sideabrbbutton
            isActive={activeItem === 'Logout'}
            onClick={() => handleItemClick('Logout')}
          >
            Logout
          </Sideabrbbutton>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;