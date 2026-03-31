import React from 'react'
import batchlist from "../../../../assets/images/batchlist.png"
import GradiantButton from '@/components/ui/buttons/GradiantButton'
import { IoSearch } from "react-icons/io5";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/Pagination';
import GrayButton from '@/components/ui/buttons/GrayButton';

function BatchList({ onClose }) {

  const batchData = [
    {
      name: "Akharat-Jan25-B1",
      students: 22,
      date: "05-Jan-2025",
      mentor: "Usama/Zain",
      status: "Active",
    },
    {
      name: "Akharat-Jan25-B2",
      students: 10,
      date: "22-Jan-2025",
      mentor: "Zubair",
      status: "Active",
    },
    {
      name: "Akharat-Jan25-B3",
      students: "06",
      date: "05-Feb-2025",
      mentor: "N/A",
      status: "Active",
    },
    {
      name: "Akharat-Jan24-B1",
      students: "N/A",
      date: "01-Jan-2024",
      mentor: "Usman",
      status: "Inactive",
    },
  ];

  return (
    <div className='w-full max-w-[1261px] rounded-[10px] sm:rounded-[14px] p-[15px] sm:p-[30px] flex flex-col gap-[15px] sm:gap-[20px] bg-[#FFFFFF] mx-auto overflow-hidden'>
      {/* Modal Header */}
      <div className='flex items-center gap-[12px]'>
        <div className='w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] rounded-full flex items-center justify-center border-[0.5px] border-[#3758EE] bg-[#F4F7FF] flex-shrink-0'>
          <img src={batchlist} alt="batch icon" className="w-[18px] sm:w-[20px]" />
        </div>
        <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1A1A1A]">Assign New Batch</h3>
      </div>

      {/* Course Selection */}
      <div className='flex flex-col gap-[8px]'>
        <label className='font-medium text-[14px] sm:text-[16px] text-[#1A1A1A]'>Course name</label>
        <select className="w-full h-[44px] sm:h-[48px] border border-[#E4E4E4] rounded-[6px] px-4 text-[#A7A7A7] outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23A7A7A7\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.2em' }}>
          <option value="">Select Available Courses</option>
          <option value="web">Web Development</option>
          <option value="app">App Development</option>
          <option value="uiux">UI/UX Design</option>
        </select>
      </div>

      {/* Batch List Section */}
      <div className='w-full rounded-[6px] border-[0.3px] border-[#EDEDED] p-[10px] sm:p-[20px] flex flex-col gap-[15px] sm:gap-[20px]'>
        <div className='flex flex-col lg:flex-row justify-between lg:items-center gap-[15px]'>
          <div className='flex flex-col gap-[4px]'>
            <h2 className='text-[#1A1A1A] font-medium text-[18px] sm:text-[22px]'>Batch List</h2>
            <p className='text-[#A7A7A7] text-[11px] sm:text-[12px]'>Manage your Course-Batch</p>
          </div>
          <div className='flex flex-col sm:flex-row gap-[10px] items-center'>
            <div className="relative w-full sm:w-[300px] lg:w-[447px]">
              <input
                type='text'
                placeholder='Search by name'
                className='w-full h-[40px] pl-10 pr-4 rounded-[4px] border border-[#E4E4E4] text-sm focus:outline-none focus:border-[#3758EE]'
              />
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A7A7A7]" />
            </div>
            <GradiantButton className="w-full sm:w-[112px] h-[40px] rounded-[4px] text-white flex items-center justify-center gap-2 text-sm font-medium">
              Search
            </GradiantButton>
          </div>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <div className="overflow-x-auto no-scrollbar border rounded-[6px]">
          <div className="min-w-[800px]"> {/* Ensures table doesn't compress too much */}
            {/* Table Headers */}
            <div className='grid grid-cols-6 items-center px-4 py-3 bg-[#F9FAFB] text-[#1A1A1A] font-medium text-[13px] sm:text-[14px] border-b'>
              <div>Batch Name/Number</div>
              <div className="text-center">Total Students</div>
              <div className="text-center">Created Date</div>
              <div className="text-center">Mentors</div>
              <div className="text-center">Status</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Content */}
            <div className="flex flex-col">
              {batchData.map((batch, index) => (
                <div key={index} className="grid grid-cols-6 items-center px-4 py-4 border-b border-[#EDEDED] last:border-0 text-[13px] sm:text-[14px] text-[#4B5563]">
                  <div className="font-medium text-[#1A1A1A]">{batch.name}</div>
                  <div className="text-center">{batch.students}</div>
                  <div className="text-center">{batch.date}</div>
                  <div className="text-center">{batch.mentor}</div>
                  <div className={`text-center font-medium ${batch.status === "Active" ? "text-[#3758EE]" : "text-[#EF4444]"
                    }`}>
                    {batch.status}
                  </div>
                  <div className="text-right">
                    <GradiantButton className={`px-3 sm:px-4 py-1.5 rounded-[4px] text-white text-[11px] sm:text-xs font-semibold ${batch.status === "Active" ? "opacity-100" : "opacity-50"
                      }`}>
                      Assigned Batch
                    </GradiantButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-2 flex justify-center sm:justify-end overflow-hidden pb-1">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem className="hidden sm:inline-block">
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem className="hidden sm:inline-block">
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Modal Actions */}
      <div className='flex flex-col-reverse sm:flex-row justify-end gap-[12px] sm:gap-[16px] mt-2 mb-1 sm:mb-0'>
        <GrayButton
          onClick={onClose}
          className="w-full sm:w-[150px] h-[40px] sm:h-[44px] rounded-[8px] text-[14px] font-medium"
        >
          Cancel
        </GrayButton>
        <GradiantButton
          onClick={onClose}
          className="w-full sm:w-[160px] h-[40px] sm:h-[44px] rounded-[4px] text-white text-[14px] font-semibold"
        >
          Save
        </GradiantButton>
      </div>
    </div>
  );
}

export default BatchList;