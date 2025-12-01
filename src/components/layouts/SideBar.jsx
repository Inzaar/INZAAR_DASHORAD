import Sideabrbbutton from '../ui/buttons/Sideabrbbutton'

function Sidebar() {
  return (
    <div className='w-[240px] h-[700px] p-2 border-[3px] border-[#6984E6]'>
      <div className='w-[192px] h-[44px] mx-auto text-[#6A6F78] hover:text-[#265CEB] text-[14px] flex items-center justify-center'>
        Welcome, Muhammad Zain
      </div>

      <div className='w-[192px] flex flex-col gap-[10px] mx-auto'>
        <Sideabrbbutton>
          Dashboard
        </Sideabrbbutton>
        <Sideabrbbutton>
          My Courses
        </Sideabrbbutton>
        <Sideabrbbutton>
          Certificates
        </Sideabrbbutton>
        <Sideabrbbutton>
          Profile
        </Sideabrbbutton>
        <Sideabrbbutton>
          Notification
        </Sideabrbbutton>
        <Sideabrbbutton>
          Help Center
        </Sideabrbbutton>
        <div className='w-full flex flex-col items-start gap-2 text-[14px] text-[#6A6F78] font-[500]'>
          <div>USER</div>
          <Sideabrbbutton>
          Logout
        </Sideabrbbutton>
        </div>
      </div>

    </div>
  )
}

export default Sidebar
