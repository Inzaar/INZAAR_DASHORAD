import { useState } from 'react';
import Sideabrbbutton from '../ui/buttons/Sideabrbbutton';

function Sidebar() {
  // 1. Create state to track the active menu item
  // Default is set to 'Dashboard'
  const [activeItem, setActiveItem] = useState('Dashboard');

  // 2. Helper function to change the active item
  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  return (
    <div className='w-[240px] h-[700px] p-2 border-[3px] border-[#6984E6] rounded-[6px]'>
      <div className='w-[192px] h-[44px] mx-auto text-[#6A6F78] hover:text-[#265CEB] text-[14px] flex items-center justify-center'>
        Welcome, Muhammad Zain
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