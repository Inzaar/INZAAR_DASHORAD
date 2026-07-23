import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthLeft from '../components/AuthLeft'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import Textarea1 from '../../../components/ui/inputs/Textarea1'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'
import AuthText from '../components/AuthText'
import { useRegister } from '../context/RegisterContext'
import { register as registerUser } from '../../../api/auth'
import { useAuth } from '../../../context/AuthContext'
import { useTranslation } from 'react-i18next'

function RegisterPageP2() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formData, updateFormData } = useRegister();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-capitalize first letter for certain fields
    if (["Nationality", "Permanent Address", "Educational Qualification"].includes(name) && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    const fieldMap = {
      "Gender": "gender",
      "DOB": "dob",
      "Educational Qualification": "educationQualification",
      "Nationality": "nationality",
      "Permanent Address": "permanentAddress",
      "Already Attended a Religious Course, give details if any:": "attendedReligiousCourseDetails",
      "How Did You Come To Know About Inzaar/Course:": "referralSource"
    };
    updateFormData({ [fieldMap[name] || name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Final validation (referralSource is optional)
      if (!formData.gender || formData.gender === "Choose" || !formData.dob || !formData.nationality || !formData.permanentAddress) {
        throw new Error(t('auth.error_fill_all_required_p2', 'Please fill in all required fields (Gender, DOB, Nationality, and Address).'));
      }

      const res = await registerUser(formData);
      
      if (res.data.success) {
        const { user, token } = res.data.data;
        // Automatically login the user
        login({
          id: user._id,
          name: `${user.firstname} ${user.lastname || ''}`.trim(),
          firstname: user.firstname,
          email: user.email,
          role: user.role || 'user',
          loggedIn: true
        }, token);

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.data.message || t('auth.registration_failed', 'Registration failed.'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('auth.something_went_wrong', 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage>
      <AuthLeft />
      <AuthRight className="flex flex-col gap-1 py-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full items-center">
          <div className='max-w-[500px] w-full'>
            <AuthHeading>
              {t('auth.create_new_account', 'Create New Account')}
            </AuthHeading>
          </div>

          <div className='max-w-[500px] w-full'>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          </div>

          <div className='max-w-[500px] w-full flex gap-2'>
            <div className={`h-[76px] w-[50%] flex flex-col items-start justify-between`}>
              <label className='text-[#18181B] text-[16px]'>{t('auth.gender', 'Gender')}</label>
              <select 
                name="Gender"
                value={formData.gender}
                onChange={handleChange}
                className='w-full h-[52px] border border-[#71717A]/30 outline-[#71717A] text-[#71717A] text-[14px] rounded px-2'
              >
                <option value="Choose">{t('auth.choose', 'Choose')}</option>
                <option value="Male">{t('auth.male', 'Male')}</option>
                <option value="Female">{t('auth.female', 'Female')}</option>
                <option value="Other">{t('auth.other', 'Other')}</option>
              </select>
            </div>
            <div className="w-[50%]">
              <Input1 
                name="DOB" 
                label={t('auth.dob', 'DOB')}
                type="date"
                placeholder={t('auth.your_age', 'your age')}
                value={formData.dob}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className='max-w-[500px] w-full'>
            <Input1 
              name="Educational Qualification" 
              placeholder={t('auth.your_educational_qualification', 'Your Educational Qualification')} 
              value={formData.educationQualification}
              onChange={handleChange}
            />
          </div>

          <div className='max-w-[500px] w-full'>
            <Input1 
              name="Nationality" 
              placeholder={t('auth.your_nationality', 'your nationality')} 
              value={formData.nationality}
              onChange={handleChange}
            />
          </div>

          <div className='max-w-[500px] w-full'>
            <Input1 
              name="Permanent Address" 
              placeholder={t('auth.your_permanent_address', 'your Permanent Address')} 
              value={formData.permanentAddress}
              onChange={handleChange}
            />
          </div>

          <div className='max-w-[500px] w-full'>
            <Textarea1 
              name="Already Attended a Religious Course, give details if any:"
              placeholder={t('auth.details', 'details')}
              value={formData.attendedReligiousCourseDetails}
              onChange={handleChange}
            />
          </div>

          <div className='max-w-[500px] w-full'>
            <Textarea1 
              name="How Did You Come To Know About Inzaar/Course:"
              placeholder={t('auth.feedback', 'feedback')}
              value={formData.referralSource}
              onChange={handleChange}
            />
          </div>

          <GradiantButton 
            type="submit"
            disabled={loading}
            className="w-full max-w-[500px] h-[52px] rounded"
          >
            {loading ? t('auth.creating_account', 'Creating Account...') : t('auth.completed', 'Completed')}
          </GradiantButton>

          <AuthText className="mt-[10px]" isRegisterPage={true} />
        </form>
      </AuthRight>
    </AuthPage>
  )
}

export default RegisterPageP2
