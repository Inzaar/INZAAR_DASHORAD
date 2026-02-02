// import ProfileDesign from "@/components/ui/profileDesign/ProfileDesign";
import Account from "./Account";
// import profile from "@/assets/images/profile.png"

function Profile() {
    return (
        <div className="w-full gap-[24px] rotate-0 opacity-100  bg-red-500 relative">
            {/* <ProfileDesign /> */}

            <div className="gap-[22px] flex">
                {/* div left */}
                <div className="w-[300px]">
                    <div className="w-[150px] h-[150px] rounded-full overflow-hidden bg-gray-400 absolute top-[55px] left-[20px]">
                        {/* <img
                            src={profile}
                            alt="profile"
                            className="w-full h-full object-cover scale-x-[-1]"
                        /> */}
                    </div>
                    {/* <div className="w-[1056px] h-[70px] border flex justify-evenly">
                    <div className="w-[916px] h-[70px] gap-[8px] border ">
                        <h4 className="font-bold w-full h-[38px] bg-green-300">Zain</h4>
                        <h4 className="w-full h-[24px] bg-yellow-500">zain@gmail.com</h4>
                    </div>
                    <div className="w-[123px] h-[40px] border">zain</div>
                  </div> */}
                    <div className="w-[260px] h-[74px] gap-[8px] absolute top-[220px] left-[25px]">
                        {/* <h5>Zain</h5> */}
                        <h6 className="font-bold text-[16px] leading-[22px] tracking-[-0.7%] text-[#1E293B]">Personal Info</h6>
                        <p className="font-bold text-[14px] leading-[160%] tracking-[0%] text-[#475569]">You can change  your personal information settings here.</p>
                    </div>
                </div>

                {/* div right */}
                <div className="w-[1056px] h-[70px] border flex justify-evenly">
                    <div className="w-[916px] h-[70px] gap-[8px] border ">
                        <h4 className="font-bold w-full h-[38px] bg-green-300">Zain</h4>
                        <h4 className="w-full h-[24px] bg-yellow-500">zain@gmail.com</h4>
                    </div>
                    <div className="w-[123px] h-[40px] border  flex justify-center items-center bg-[#B1B1B1] text-[#FFFFFF] ">Log Out</div>
                </div>
                <div className="w-[] gap-[12px] absolute top-[200px] left-[450px]">
                    {/* buttons */}
                    <div className="w-[333px] h-[40px] rotate-0 opacity-100 p-1 flex bg-gray-200 rounded">
                        {/* account button */}
                        <div className="w-[162px] h-[32px] bg-white flex items-center justify-center rounded">
                            <h6 className="font-sans font-medium text-sm leading-[20px] tracking-normal text-center text-[#18181B]">Account</h6>
                        </div>
                        <div className="w-[162px] h-[32px] bg-transparent flex items-center justify-center rounded">
                            <h6 className="font-sans font-medium text-sm leading-[20px] tracking-normal text-center text-[#71717A]">Other</h6>
                        </div>
                    </div>
                    <Account />
                </div>
            </div>
        </div>
    )
}

export default Profile;