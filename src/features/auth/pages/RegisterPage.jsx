import AuthLeft from '../components/AuthLeft'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import PhoneInput from '../../../components/ui/inputs/PhoneInput'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'

function RegisterPage() {
  return (
    <AuthPage>
      <AuthLeft />
      <AuthRight className="flex flex-col gap-3">
        <div className='max-w-[500px] w-full'>
          <AuthHeading>
            Create New Account
          </AuthHeading>
        </div>

        <div className='max-w-[500px] w-full flex gap-2'>
          <Input1 name="First Name"/>
          <Input1 name="Last Name" />
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 name="Username"/>
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 name="Email"/>
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 name="Password"/>
        </div>

        <div className='max-w-[500px] w-full mt-[10px]'>
          <label className='text-[16px] text-[#18181B]'>Phone number</label>
          <PhoneInput />
        </div>

        <GradiantButton className="max-w-[500px] w-full h-[52px] rounded mt-[10px]">
          Next
        </GradiantButton>

        <div className='max-w-[548px] w-full flex flex-col gap-4'>

  {/* Checkbox 1 */}
  <div className='flex items-start w-full gap-3 mt-10'>
    <input 
      type='checkbox' 
      id="terms"
      className='w-5 h-5 mt-0.5 accent-[#7F60EA] cursor-pointer shrink-0 rounded'
    />
    <label htmlFor="terms" className='text-[16px] font-[400] text-[#333333CC] cursor-pointer leading-tight select-none'>
      By creating an account, I agree to our <span className='underline'>Terms of use</span>and <span className='underline'>Privacy Policy</span>
    </label>
  </div>

  {/* Checkbox 2 */}
  <div className='flex items-start w-full gap-3'>
    <input 
      type='checkbox' 
      id="newsletter"
      className='w-5 h-5 mt-0.5 accent-[#7F60EA] cursor-pointer shrink-0 rounded'
    />
    <label htmlFor="newsletter" className='text-[16px] font-[400] text-[#333333CC] cursor-pointer leading-tight select-none'>
      By creating an account, I am also consenting to receive SMS messages and emails, including product new feature updates, Courses, and marketing promotions.
    </label>
  </div>

</div>
      </AuthRight>
    </AuthPage>
  )
}

export default RegisterPage
