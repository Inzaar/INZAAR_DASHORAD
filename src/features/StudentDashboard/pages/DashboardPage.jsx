import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import { Calendar18 } from '@/components/shared/Calender';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import LectureCard from '@/components/shared/LectureCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import Navbar from '@/components/layouts/NavBar';
import StatusTable from '@/components/ui/statusTable/StatusTable';
import Analytics from '../components/Analytics';
import EnrolledCourse from '../components/EnrolledCourse';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getStudentDashboard, getUserProfile } from '@/api/dashboards';
import { Loader } from 'lucide-react';

const DashboardPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLectureDropdownOpen, setIsLectureDropdownOpen] = useState(false);
    const [selectedLectureFilter, setSelectedLectureFilter] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    // const userId = localStorage.getItem('userId');
    // const firstName = localStorage.getItem('firstName');
    const progressPercentage = 40;

    const [userCourses, setUserCourses] = useState([]);

    // useEffect(() => {
    //     const fetchUserProfile = async () => {
    //         setLoading(true);
    //         try {
    //             const res = await login({ "email": "johndoe@example.com", "password": "Password123!" });
    //             console.log(res.data.data.user);
    //             setUserData(res.data.data.user);
    //         } catch (error) {
    //             console.log(error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     fetchUserProfile();
    // }, [])

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchStudentDashboard = async () => {
            setLoading(true);
            try {
                const res = await getUserProfile();
                setUserCourses(res.data.data);
                setUserData(res.data.data.user);
                // console.log("userCourses", userCourses)
            } catch (error) {
                console.log(error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchStudentDashboard();
    }, [user, navigate])

    // Extract valid course objects for dropdown to prevent identical name conflicts
    const lectureOptions = userCourses?.enrolledCourses?.map(c => ({ _id: c._id, title: c.title })) || [];
    // Set default selection when courses load
    useEffect(() => {
        if (lectureOptions.length > 0 && !selectedLectureFilter) {
            setSelectedLectureFilter(lectureOptions[0]._id);
        }
    }, [userCourses]); // Run when userCourses updates

    // Find the selected course data by its unique _id
    const selectedCourseData = userCourses?.enrolledCourses?.find(course =>
        course._id === selectedLectureFilter
    );

    const filteredLectures = selectedCourseData?.lectures || [];
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Removed global loading to show fetching state inside components as requested
    // if (loading) {
    //     return (
    //         <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
    //             <Loader className="w-10 h-10 text-[#3758EE] animate-spin mb-4" />
    //             <p className="text-[#6A6F78] font-medium animate-pulse">Loading dashboard...</p>
    //         </div>
    //     );
    // }

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                        transition-transform duration-300 ease-in-out z-40
                        lg:translate-x-0 lg:static lg:block
                        fixed left-0 top-0 shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="py-4 pr-2">
                            <div className="flex justify-between items-start mb-8 gap-4 w-full">
                                <div>
                                    <h2 className="text-[18px] min-[430px]:text-[24px] min-[641px]:text-3xl font-bold text-gray-900 mb-1">Aslam o Alaikum {userData?.firstname} 👋🏻</h2>
                                    <p className="text-gray-500 text-[10px] min-[641px]:text-[16px]">Let's learn something new today!</p>
                                </div>
                                <GradiantButton onClick={() => navigate('/courses')} className="max-[600px]:hidden px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                    Enrolled New Course
                                </GradiantButton>
                                <GradiantButton onClick={() => navigate('/courses')} className="max-[600px]:block hidden text-[24px] px-4 py-1 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                    +
                                </GradiantButton>
                            </div>

                            <div className="gap-6">
                                <div className=" flex flex-col gap-6">
                                    <Analytics userCourses={userCourses} name="Performance Overview" />

                                    <div className='flex w-full gap-6'>
                                        <div className="w-full min-[680px]:w-[55%] p-4 min-[850px]:w-[65%] min-[1250px]:w-[70%] min-[1400px]:w-[75%] bg-white rounded-lg flex flex-col pt-2 px-2 shadow-sm no-scrollbar">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Enrolled Courses</h3>
                                            <EnrolledCourse userCourses={userCourses?.enrolledCourses} loading={loading} />
                                            <div className="w-full h-2 mt-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#A892FF] rounded-full transition-all duration-300 ease-in-out"
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="hidden min-[680px]:flex min-[680px]:w-[45%] min-[850px]:w-[35%] min-[1250px]:w-[30%] min-[1400px]:w-[25%] flex-col">
                                            <Calendar18 className="w-full h-full flex-1" />
                                        </div>
                                    </div>

                                    <div className="flex gap-6 max-[900px]:flex-col">
                                        <HoursSpentCard className="w-full shadow-sm min-[900px]:w-[60%]" userCourses={userCourses} name={"Hours Spent"} />
                                        
                                        {/* Mobile Calendar - Visible only below 680px */}
                                        <div className="min-[680px]:hidden w-full bg-white rounded-lg p-4 shadow-sm">
                                            <Calendar18 className="w-full h-[350px]" />
                                        </div>

                                        <div className="w-full min-[900px]:w-[45%] min-[1400px]:w-[60%] flex flex-col gap-6 bg-white rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-bold text-gray-900">Ongoing Lectures</h3>
                                                <div className="relative z-20">
                                                    <button
                                                        onClick={() => setIsLectureDropdownOpen(!isLectureDropdownOpen)}
                                                        className="flex items-center gap-2 bg-gray-100/60 rounded-lg px-4 py-2 shadow-sm text-sm text-gray-700 hover:bg-gray-100 transition-colors w-[120px] min-[450px]:w-full min-[900px]:w-[120px] justify-between"
                                                    >
                                                        <span className="truncate max-w-[150px]">
                                                            {selectedCourseData?.title || "Select Course"}
                                                        </span>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className={`w-4 h-4 transition-transform duration-200 ${isLectureDropdownOpen ? 'rotate-180' : ''}`}
                                                        >
                                                            <path d="m6 9 6 6 6-6" />
                                                        </svg>
                                                    </button>

                                                    {isLectureDropdownOpen && (
                                                        <div className="absolute top-full mt-1 right-0 w-[200px] bg-white rounded-lg shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-100 z-50 max-h-[300px] overflow-y-auto no-scrollbar">
                                                            {lectureOptions.length > 0 ? (
                                                                lectureOptions.map((option) => (
                                                                    <button
                                                                        key={option._id}
                                                                        onClick={() => {
                                                                            setSelectedLectureFilter(option._id);
                                                                            setIsLectureDropdownOpen(false);
                                                                        }}
                                                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedLectureFilter === option._id ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'}`}
                                                                    >
                                                                        {option.title}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="px-3 py-2 text-sm text-gray-400">No courses found</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                                                {loading ? (
                                                    <div className="w-full h-[160px] text-center py-8 text-gray-500 flex items-center justify-center animate-pulse italic">
                                                        Wait, we're fetching your course data...
                                                    </div>
                                                ) : filteredLectures.length > 0 ? (
                                                    filteredLectures.map((lecture) => (
                                                        <LectureCard
                                                            key={lecture._id}
                                                            title={lecture.name}
                                                            image={selectedCourseData?.thumbnail}
                                                            lecture={String(lecture.lectureNo).padStart(2, '0')}
                                                            className="shadow-sm"
                                                            onClick={() => navigate(`/course-view?id=${selectedCourseData._id}&lectureId=${lecture._id}`)}
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="w-full h-[160px] text-center py-8 text-gray-500 flex items-center justify-center">
                                                        No ongoing lectures found
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#A892FF] rounded-full transition-all duration-300 ease-in-out"
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <StatusTable userCourses={userCourses} loading={loading} />
                        </div>

                    </main>
                </div >

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />
            </div >
        </div >
    );
};

export default DashboardPage;