import React from 'react'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthLeft from '../components/AuthLeft'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'
import AuthText from '../components/AuthText'

function ResetPage() {
  return (
    <AuthPage>
        <AuthLeft />
        <AuthRight className="flex flex-col gap-3">
                <div className='max-w-[500px] w-full'>
                    <AuthHeading>
                        Reset Your Password
                    </AuthHeading>
                </div>

                <div className='max-w-[500px] w-full'>
                    <Input1 name="New Password" placeholder="your new password" />
                </div>

                <div className='max-w-[500px] w-full'>
                    <Input1 name="Confirm New Password" placeholder="new password again" />
                </div>

                <GradiantButton className="max-w-[500px] w-full h-[52px] rounded mt-[10px]">
                    Reset Password
                </GradiantButton>

                <AuthText className="mt-[30px]"/>
            </AuthRight>
    </AuthPage>
  )
}

export default ResetPage
