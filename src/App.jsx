import { useState, useEffect } from "react"
import GradiantButton from "./components/ui/buttons/GradiantButton"
import thumbnail from "./assets/images/course2.png"
import profile from "./assets/icons/profile.png"
import { ForgetPassword, LoginPage, RegisterPageP1, RegisterPageP2 } from "./features/auth"
import ResetPage from "./features/auth/pages/ResetPage"
import Sidebar from "./components/layouts/SideBar"
import Loader from "./components/ui/Loader"
import { Calendar18 } from "./components/shared/Calender"
import CourseCard from "./components/shared/CourseCard"
import PerformanceCard from "./components/shared/PerformanceCard"
import HoursSpentCard from "./components/shared/HoursSpentCard"
import LectureCard from "./components/shared/LectureCard"
import OverviewCard from "./components/shared/OverviewCard"

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const course = {
    title: "Introduction to React",
    time: "10 Lectures (3 hours, 23 minutes, 24 seconds)",
    category: "Web Development",
    description: "Course explains Day of Judgment using Quranic verses and authentic Ahadith.",
    price: 49.99,
    thumbnail: thumbnail,
    icon: profile
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <GradiantButton className="p-4 rounded-lg h-[100px]">Enroll Now</GradiantButton>
      <LoginPage />
      <RegisterPageP1 />
      <RegisterPageP2 />
      <ForgetPassword />
      <ResetPage />
      <Sidebar />
      {/* <Loader /> */}

      <GradiantButton className={"w-[200px] h-[52px]"}>Watch Again</GradiantButton>
      <Calendar18 />
      {/* <CourseCard course={course} /> */}
      <CourseCard />
      <PerformanceCard />
      <HoursSpentCard />
      <LectureCard />
      <OverviewCard />
    </div>
  )
}

export default App
