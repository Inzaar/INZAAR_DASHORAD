import React from "react";
import { useTranslation } from "react-i18next";

function Other({ setUserPayload, userPayload, userInfo }) {
    const { t } = useTranslation();
    return (
        <div className="w-full p-[24px] gap-[24px] rounded-[12px] b-[1px] bg-[#FFFFFF]  border border-[#E2E8F0]">
            <div className="w-full rotate-0 opacity-100 flex flex-col gap-[5px] ">

                <div className="w-full gap-4 flex flex-col sm:flex-row">
                    {/* gender field */}
                    <div className="w-full sm:w-[50%] gap-2  flex flex-col">
                        <label className="leading-[1.8]">{t('gender_required', 'Gender*')} </label>
                        <div>
                            <select
                                className=" w-full h-[52px] rounded-md px-3 border border-[#E4E4E7] "
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
                    <div className="w-full sm:w-[50%]">
                        <div className="w-full gap-2 flex flex-col">
                            <label className="leading-[1.8]">{t('dob_required', 'Date Of Birth*')} </label>

                            <input
                                type="date"
                                placeholder={t('enter_dob', 'Enter Your DOB')}
                                value={userPayload?.dob ? new Date(userPayload.dob).toISOString().split('T')[0] : ''}
                                onChange={(e) => setUserPayload({ ...userPayload, dob: e.target.value })}
                                className="h-[52px] rounded-md px-3 border border-[#E4E4E7]"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full gap-4 flex flex-col sm:flex-row">
                    {/* Educational qualification */}
                    <div className=" gap-2 flex flex-col mt-6 w-full sm:w-[50%]">
                        <label className="leading-[1.8]">{t('education_required', 'Educational Qualification*')} </label>

                        <input
                             type="text"
                             placeholder={t('enter_education', 'Enter Your Educational Qualification')}
                             value={userPayload?.educationQualification || ''}
                             onChange={(e) => setUserPayload({ ...userPayload, educationQualification: e.target.value })}
                             className="w-full h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                    {/* national */}
                    <div className="w-full sm:w-[50%] gap-2 flex flex-col mt-6">
                        <label className="leading-[1.8]">{t('nationality_required', 'Nationality*')} </label>

                        <input
                             type="text"
                             placeholder={t('enter_nationality', 'Enter Your Nationality')}
                             value={userPayload?.nationality || ''}
                             onChange={(e) => setUserPayload({ ...userPayload, nationality: e.target.value })}
                             className="w-full h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                </div>

                <div className="w-full gap-4 flex flex-col sm:flex-row">
                    {/* permanent address */}
                    <div className=" gap-2 flex flex-col mt-6 flex-1">
                        <label className="leading-[1.8]">{t('permanent_address_required', 'Permanent Address*')} </label>

                        <input
                            type="text"
                            placeholder={t('enter_permanent_address', 'Enter Your Permanent Address')}
                            value={userPayload?.permanentAddress || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, permanentAddress: e.target.value })}
                            className="w-full h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                </div>

                <div className="w-full gap-4 flex flex-col sm:flex-row">
                    {/*Religious course */}
                    <div className=" gap-2 flex flex-col flex-1">
                        <label className="leading-[1.8]">
                            {t('attended_religious_course_lbl', 'Already Attended a Religious Course, give details if any: ')}{" "}
                        </label>

                        <textarea
                            type="text"
                            placeholder={t('enter_details', 'Enter Details')}
                            value={userPayload?.attendedReligiousCourseDetails || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, attendedReligiousCourseDetails: e.target.value })}
                            className="w-full h-[82px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 pt-16px pr-3 pb-46px pl-3 gap-4  "
                        />
                    </div>
                </div>

                <div className="w-full gap-4 flex flex-col sm:flex-row">
                    {/*inzar courses*/}
                    <div className=" gap-2 flex flex-col flex-1">
                        <label className="leading-[1.8]">{t('how_know_about_inzaar_lbl', 'How Did You Come To Know About Inzaar/Course: ')} </label>

                        <textarea
                            type="text"
                            placeholder={t('enter_feedback', 'Enter Feedback')}
                            value={userPayload?.referralSource || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, referralSource: e.target.value })}
                            className="w-full h-[82px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 pt-16px pr-3 pb-46px pl-3 gap-4  "
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Other;