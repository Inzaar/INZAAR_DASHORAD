import React from 'react'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthLeft from '../components/AuthLeft'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'
import AuthText from '../components/AuthText'

function RegisterPageP2() {
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
          <Input1 name="Gender" placeholder="Gender"/>
          <Input1 name="DOB" placeholder="your age"/>
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 name="Educational Qualification" placeholder="your educational qualification"/>
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 name="Nationality" placeholder="your nationality"/>
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 name="Permanent Address" placeholder="your permanent address"/>
        </div>

        <GradiantButton className="max-w-[500px] w-full h-[52px] rounded mt-[15px]">
          Completed
        </GradiantButton>

        <AuthText className="mt-[20px]"/>
        </AuthRight>
    </AuthPage>
  )
}

export default RegisterPageP2
