import React, { useState } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBatches, updateBatch } from '../../../../api/batch';
import { getAllCourses } from '../../../../api/course';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function BatchList({ onClose, moderatorId }) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 4;
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: (batchId) => updateBatch(batchId, { assignedModerator: moderatorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['user'] }); // Also refresh moderator batches list if needed
      toast.success('Batch assigned successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign batch');
    }
  });

  const { data: batches = [], isLoading, isError } = useQuery({
    queryKey: ['batches'],
    queryFn: getAllBatches
  });

  const { data: coursesResponse, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getAllCourses
  });
  
  const courses = coursesResponse?.data?.data || [];

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourseId ? batch.courseId?._id === selectedCourseId : true;
    return matchesSearch && matchesCourse;
  });

  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);

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
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full h-[44px] sm:h-[48px] border border-[#E4E4E4] rounded-[6px] px-4 text-[#A7A7A7] outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23A7A7A7\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.2em' }}>
          <option value="">Select Available Courses</option>
          {isCoursesLoading ? (
            <option value="" disabled>Loading courses...</option>
          ) : (
            courses.map(course => (
              <option key={course._id} value={course._id}>{course.title || course.name}</option>
            ))
          )}
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
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (e.target.value === '') {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(inputValue);
                    setCurrentPage(1);
                  }
                }}
                className='w-full h-[40px] pl-10 pr-4 rounded-[4px] border border-[#E4E4E4] text-sm focus:outline-none focus:border-[#3758EE]'
              />
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A7A7A7]" />
            </div>
            <GradiantButton
              onClick={() => {
                setSearchQuery(inputValue);
                setCurrentPage(1);
              }}
              className="w-full sm:w-[112px] h-[40px] rounded-[4px] text-white flex items-center justify-center gap-2 text-sm font-medium">
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
            <div className="flex flex-col relative min-h-[100px]">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <span className="text-[#3758EE] font-medium">Loading batches...</span>
                </div>
              )}
              {isError && (
                <div className="w-full text-center py-8 text-[#EF4444]">
                  Failed to load batches. Please try again.
                </div>
              )}
              {!isLoading && !isError && filteredBatches.length === 0 && (
                <div className="w-full text-center py-8 text-[#A7A7A7]">
                  No batches found matching your search.
                </div>
              )}
              {!isLoading && !isError && filteredBatches
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((batch, index) => {
                  const isActive = batch.status === 'published';
                  const statusLabel = isActive ? 'Active' : 'Inactive';
                  const dateDisplay = batch.createdAt ? format(new Date(batch.createdAt), 'dd-MMM-yyyy') : 'N/A';
                  const mentorDisplay = batch.assignedModerator?.fullName || batch.assignedModerator?.name || batch.assignedModerator?.username || 'N/A';

                  return (
                    <div key={batch._id || index} className="grid grid-cols-6 items-center px-4 py-4 border-b border-[#EDEDED] last:border-0 text-[13px] sm:text-[14px] text-[#4B5563]">
                      <div className="font-medium text-[#1A1A1A]">{batch.name}</div>
                      <div className="text-center">{batch.limit || 'N/A'}</div>
                      <div className="text-center">{dateDisplay}</div>
                      <div className="text-center">{mentorDisplay}</div>
                      <div className={`text-center font-medium ${isActive ? "text-[#3758EE]" : "text-[#EF4444]"}`}>
                        {statusLabel}
                      </div>
                      <div className="text-right">
                        <GradiantButton
                          onClick={() => assignMutation.mutate(batch._id)}
                          disabled={assignMutation.isPending || batch.assignedModerator?._id === moderatorId}
                          className={`px-3 sm:px-4 py-1.5 rounded-[4px] text-white text-[11px] sm:text-xs font-semibold ${isActive ? "opacity-100" : "opacity-30"}`}
                        >
                          {assignMutation.isPending && assignMutation.variables === batch._id ? "Assigning..." :
                            batch.assignedModerator?._id === moderatorId ? "Assigned" :
                              batch.assignedModerator ? "Replace Moderator" : "Assign Batch"}
                        </GradiantButton>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-auto pt-4 flex justify-center sm:justify-end overflow-hidden pb-1">
            <Pagination totalPages={totalPages}>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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