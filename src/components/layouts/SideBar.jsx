import { useEffect, useState } from 'react'; // Added useEffect
import { X } from 'lucide-react';
import Sideabrbbutton from '../ui/buttons/Sideabrbbutton';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation

function Sidebar({ className, onClose }) {
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL (e.g., /profile)
  const [activeItem, setActiveItem] = useState('Dashboard');

  // Map your URL paths to the Display Names
  const pathToName = {
    '/dashboard': 'Dashboard',
    '/enrolled-courses': 'My Courses',
    '/courses': 'My Courses',
    '/certificates': 'Certificates',
    '/profile': 'Profile',
    '/notification': 'Notification',
    '/help-center': 'Help Center',
    '/logout': 'Logout'
  };

  // Sync state with URL whenever the route changes
  useEffect(() => {
    const currentName = pathToName[location.pathname];
    if (currentName) {
      setActiveItem(currentName);
    }
  }, [location.pathname]);

  const handleItemClick = (itemName) => {
    // Find the path associated with the clicked name
    const path = Object.keys(pathToName).find(key => pathToName[key] === itemName);

    if (path) {
      navigate(path);
    }

    if (onClose) onClose();
  };

  const menuItems = ['Dashboard', 'My Courses', 'Certificates', 'Profile', 'Notification', 'Help Center'];

  return (
    <div className={`w-[260px] h-full bg-white p-4 border border-[#3e84f3] flex flex-col z-40 rounded shadow-sm ${className}`}>
      <div className='w-full flex items-center justify-between lg:justify-center mb-6 lg:mb-0 h-[44px]'>
        <div className='text-[#6A6F78] text-[14px]'>Welcome, Muhammad Zain</div>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className='w-[192px] flex flex-col gap-[10px] mx-auto'>
        {menuItems.map((item) => (
          <Sideabrbbutton
            key={item}
            isActive={activeItem === item} // This now stays blue based on the URL
            onClick={() => handleItemClick(item)}
          >
            {item}
          </Sideabrbbutton>
        ))}

        <div className='w-full flex flex-col items-start gap-2 text-[14px] text-[#6A6F78] font-[500]'>
          <div className='mt-2'>USER</div>
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