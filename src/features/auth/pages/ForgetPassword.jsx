import React from 'react'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthLeft from '../components/AuthLeft'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'
import AuthText from '../components/AuthText'

function ForgetPassword() {
    return (
        <AuthPage>
            <AuthLeft />
            <AuthRight className="flex flex-col gap-3">
                <div className='max-w-[500px] w-full'>
                    <AuthHeading>
                        Forgot Password
                    </AuthHeading>
                </div>

                <div className='max-w-[500px] w-full'>
                    <Input1 name="Email" placeholder="your email address" />
                </div>

                <GradiantButton className="max-w-[500px] w-full h-[52px] rounded mt-[10px]">
                    Send Resent Link
                </GradiantButton>

                <AuthText className="mt-[30px]"/>
            </AuthRight>
        </AuthPage>
    )
}

export default ForgetPassword
