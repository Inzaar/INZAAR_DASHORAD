import React from "react";
import { useTranslation } from "react-i18next";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", 
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", 
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", 
  "Fiji", "Finland", "France", 
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
  "Haiti", "Holy See", "Honduras", "Hungary", 
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", 
  "Jamaica", "Japan", "Jordan", 
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", 
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", 
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", 
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", 
  "Oman", 
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
  "Qatar", 
  "Romania", "Russia", "Rwanda", 
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", 
  "Vanuatu", "Venezuela", "Vietnam", 
  "Yemen", 
  "Zambia", "Zimbabwe"
];

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

                        <select
                             value={userPayload?.nationality || ''}
                             onChange={(e) => setUserPayload({ ...userPayload, nationality: e.target.value })}
                             className="w-full h-[52px] rounded-md px-3 border border-[#E4E4E7] opacity-100 rotate-0 "
                        >
                            <option value="">{t('select_nationality', 'Select Nationality')}</option>
                            {countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
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