import GradiantButton from "./components/ui/buttons/GradiantButton"
import { CourseCard } from "./features/courses"
import thumbnail from "./assets/images/course2.png"
import profile from "./assets/icons/profile.png"
import { ForgetPassword, LoginPage, RegisterPageP1, RegisterPageP2 } from "./features/auth"
import ResetPage from "./features/auth/pages/ResetPage"

function App() {

  const course = {
    title: "Introduction to React",
    time: "10 Lectures (3 hours, 23 minutes, 24 seconds)",
    category: "Web Development",
    description: "Course explains Day of Judgment using Quranic verses and authentic Ahadith.",
    price: 49.99,
    thumbnail: thumbnail,
    icon: profile
  }


  return (
    <div>
      <GradiantButton className="p-4 rounded-lg h-[100px]">Enroll Now</GradiantButton>
      <CourseCard course={course}/>
      <LoginPage />
      <RegisterPageP1 />
      <RegisterPageP2 />
      <ForgetPassword />
      <ResetPage />
    </div>
  )
}

export default App
