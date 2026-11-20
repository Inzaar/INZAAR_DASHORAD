import React from "react";
import { useTranslation } from "react-i18next";
import EducationalQualificationInput from "@/components/shared/EducationalQualificationInput";
import NationalitySelect from "@/components/shared/NationalitySelect";


const OtherSkeleton = () => {
    return (
        <div className="w-full p-[24px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col gap-5 animate-pulse">
            <div className="w-full flex flex-col gap-5">
                {/* Gender & DOB */}
                <div className="w-full gap-4 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-[50%] gap-2 flex flex-col">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                    </div>
                    <div className="w-full sm:w-[50%] gap-2 flex flex-col">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                        <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                    </div>
                </div>

                {/* Education & Nationality */}
                <div className="w-full gap-4 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-[50%] gap-2 flex flex-col">
                        <div className="h-4 bg-gray-200 rounded w-44"></div>
                        <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                    </div>
                    <div className="w-full sm:w-[50%] gap-2 flex flex-col">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                    </div>
                </div>

                {/* Permanent Address */}
                <div className="w-full gap-2 flex flex-col">
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                    <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                </div>

                {/* Religious Course */}
                <div className="w-full gap-2 flex flex-col">
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                    <div className="w-full h-[82px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                </div>

                {/* Referral Source */}
                <div className="w-full gap-2 flex flex-col">
                    <div className="h-4 bg-gray-200 rounded w-56"></div>
                    <div className="w-full h-[82px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                </div>
            </div>
        </div>
    );
};

function Other({ setUserPayload, userPayload, userInfo, errors, isLoading = false }) {
    if (isLoading) {
        return <OtherSkeleton />;
    }
    const { t } = useTranslation();
    return (
        <div className="w-full p-4 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
            <div className="w-full flex flex-col gap-3.5 sm:gap-5">

                {/* gender & DOB */}
                <div className="w-full gap-3 sm:gap-4 flex flex-col sm:flex-row">
                    {/* gender field */}
                    <div className="w-full sm:w-1/2 gap-1.5 sm:gap-2 flex flex-col">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">{t('gender_required', 'Gender*')}</label>
                        <div>
                            <select
                                className="w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white transition-colors"
                                name="Gender"
                                id="Gender"
                                value={userPayload?.gender || "Choose"}
                                onChange={(e) => setUserPayload({ ...userPayload, gender: e.target.value })}
                            >
                                <option value="Choose">{t('choose', 'Choose')}</option>
                                <option value="Male">{t('male', 'Male')}</option>
                                <option value="Female">{t('female', 'Female')}</option>
                            </select>
                        </div>
                    </div>
                    {/* Date of birth*/}
                    <div className="w-full sm:w-1/2 gap-1.5 sm:gap-2 flex flex-col">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">{t('dob_required', 'Date Of Birth*')}</label>
                        <input
                            type="date"
                            placeholder={t('enter_dob', 'Enter Your DOB')}
                            value={userPayload?.dob ? new Date(userPayload.dob).toISOString().split('T')[0] : ''}
                            onChange={(e) => setUserPayload({ ...userPayload, dob: e.target.value })}
                            className="w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
                        />
                    </div>
                </div>

                {/* Educational qualification & Nationality */}
                <div className="w-full gap-3 sm:gap-4 flex flex-col sm:flex-row sm:items-start">
                    {/* Educational qualification */}
                    <EducationalQualificationInput
                        value={userPayload?.educationQualification || ''}
                        onChange={(val) => setUserPayload({ ...userPayload, educationQualification: val })}
                        label={t('education_required', 'Educational Qualification*')}
                        labelClassName="text-xs sm:text-sm font-semibold text-gray-700"
                        containerClassName="gap-1.5 sm:gap-2 flex flex-col w-full sm:w-1/2"
                        selectClassName="w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white transition-colors outline-none"
                        inputClassName="w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none mt-2 transition-colors"
                        placeholder="Select Educational Qualification"
                        otherPlaceholder="Specify your qualification"
                    />
                    {/* national */}
                    <div className="w-full sm:w-1/2 flex flex-col">
                        <NationalitySelect
                            label={t('nationality_required', 'Nationality*')}
                            labelClassName="text-xs sm:text-sm font-semibold text-gray-700"
                            placeholder={t('select_nationality', 'Select Nationality')}
                            value={userPayload?.nationality || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, nationality: e.target.value })}
                        />
                    </div>
                </div>

                {/* permanent address */}
                <div className="w-full gap-1.5 sm:gap-2 flex flex-col">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700">{t('permanent_address_required', 'Permanent Address*')}</label>
                    <input
                        type="text"
                        placeholder={t('enter_permanent_address', 'Enter Your Permanent Address')}
                        value={userPayload?.permanentAddress || ''}
                        onChange={(e) => setUserPayload({ ...userPayload, permanentAddress: e.target.value })}
                        className="w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
                    />
                </div>

                {/* Religious course */}
                <div className="w-full gap-1.5 sm:gap-2 flex flex-col">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700">
                        {t('attended_religious_course_lbl', 'Already Attended a Religious Course, give details if any:')}
                    </label>
                    <textarea
                        placeholder={t('enter_details', 'Enter Details')}
                        value={userPayload?.attendedReligiousCourseDetails || ''}
                        onChange={(e) => setUserPayload({ ...userPayload, attendedReligiousCourseDetails: e.target.value })}
                        className="w-full min-h-[70px] sm:min-h-[82px] rounded-lg p-3 text-xs sm:text-sm border border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors resize-none"
                    />
                </div>

                {/* inzar courses */}
                <div className="w-full gap-1.5 sm:gap-2 flex flex-col">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700">
                        {t('how_know_about_inzaar_lbl', 'How Did You Come To Know About Inzaar/Course:')}
                    </label>
                    <textarea
                        placeholder={t('enter_feedback', 'Enter Feedback')}
                        value={userPayload?.referralSource || ''}
                        onChange={(e) => setUserPayload({ ...userPayload, referralSource: e.target.value })}
                        className="w-full min-h-[70px] sm:min-h-[82px] rounded-lg p-3 text-xs sm:text-sm border border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors resize-none"
                    />
                </div>
            </div>
        </div>
    );
}

export default Other;