import { useState } from 'react';
import { X } from 'lucide-react';
import Sideabrbbutton from '../ui/buttons/Sideabrbbutton';

function Sidebar({ className, onClose }) {
  // 1. Create state to track the active menu item
  // Default is set to 'Dashboard'
  const [activeItem, setActiveItem] = useState('Dashboard');

  // 2. Helper function to change the active item
  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  return (
    <div className={`w-[260px] h-full bg-white p-4 border border-[#3e84f3] flex flex-col z-40 rounded shadow-sm ${className}`}>
      <div className='w-full flex items-center justify-between lg:justify-center mb-6 lg:mb-0 h-[44px]'>
        <div className='text-[#6A6F78] text-[14px]'>
          Welcome, Muhammad Zain
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className='w-[192px] flex flex-col gap-[10px] mx-auto'>
        {/* For each button:
            1. Check if it matches the activeItem state
            2. Pass a function to update the state on click
        */}

        <Sideabrbbutton
          isActive={activeItem === 'Dashboard'}
          onClick={() => handleItemClick('Dashboard')}
        >
          Dashboard
        </Sideabrbbutton>

        <Sideabrbbutton
          isActive={activeItem === 'My Courses'}
          onClick={() => handleItemClick('My Courses')}
        >
          My Courses
        </Sideabrbbutton>

        <Sideabrbbutton
          isActive={activeItem === 'Certificates'}
          onClick={() => handleItemClick('Certificates')}
        >
          Certificates
        </Sideabrbbutton>

        <Sideabrbbutton
          isActive={activeItem === 'Profile'}
          onClick={() => handleItemClick('Profile')}
        >
          Profile
        </Sideabrbbutton>

        <Sideabrbbutton
          isActive={activeItem === 'Notification'}
          onClick={() => handleItemClick('Notification')}
        >
          Notification
        </Sideabrbbutton>

        <Sideabrbbutton
          isActive={activeItem === 'Help Center'}
          onClick={() => handleItemClick('Help Center')}
        >
          Help Center
        </Sideabrbbutton>

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
  )
}

export default Sidebar;