import React from 'react'
import Profileimg from '@/assets/images/course.png'
function ModeratorRoll() {
  return (
    <div className='w-[629px] h-[301px] border rounded-[8px] pr-[10px] pl-[20px] flex' >
<div className='w-[230px] h-[301px] pt-[10px] pb-[10px] gap-[8px]'>
    <h3 className='text-center text-[12px]'>PROFILE IMAGE</h3>
    <img src={Profileimg} className='w-[230px] h-[236px]'></img>
    <label className="text-blue-600 text-sm cursor-pointer text-center block mt-[2px] ">
  Choose Profile Image
  <input type="file" className="hidden"/>
</label>


</div>
<div className='w-[369px] h-[301px] rounded-[8px] pt-[11px] pr-[4px] pb-[11px] pl-[14px]'>
    <div className='w-[351px] h-[279px] '>
        <h6 className='text-[12px]'>Roll:</h6>
        <div className='w-[351px] h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] '>Junior Moderator</div>
<div className='w-[351px] h-[141px] flex flex-col gap-[8px]'>
<h6 className='text-[12px]'>System Roll:</h6>
<div className='w-[351px] h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px]'><a href='#' className='text-[#265CEB] underline decoration-[#265CEB]'>Manage Batch-10</a></div>
<div className='w-[351px] h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px]'><a href='#' className='text-[#265CEB] underline decoration-[#265CEB]'>Manage Batch-14</a></div>
<div className='w-[351px] h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px]'><a href='#' className='text-[#265CEB] underline decoration-[#265CEB]'>Manage Batch-12</a></div>

</div>
<div className='w-[351px] h-[57px]'>
    <h6 className='text-[12px]'>Employment Type</h6>
<select className='w-[351px] h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] '>
    <option>Full-time</option>
    <option>Part-time</option>
</select>
</div>
    </div>

</div>

    </div>
  )
}

export default ModeratorRoll;