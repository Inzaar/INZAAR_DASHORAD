import React from "react";
import { CiBellOn } from "react-icons/ci";
import Profilelogo from "../../assets/images/course2.png";

function Navbar() {
    return (

        <div className="w-full h-[80px] flex items-center justify-center bg-gradient-to-r from-[#8B9CF1] to-[#B9A0EF] px-4">
            <div className="w-full h-[42px] flex justify-between">
                <div className="w-[153px] h-[42px]">
                    <div className="w-[116px] h-[26px] font-['Roboto'] font-semibold text-[22px] leading-[100%] tracking-[0.05em] text-[#2C2C2C] ">
                        Dashboard
                    </div>
                    <div className="w-[153px] h-[14px] font-['Roboto'] font-Regular text-[12px] leading-[100%] tracking-[5%] text-[#2C2C2C]">
                        Tuesday,January 27 2025
                    </div>
                </div>
                <div className="w-[218px] h-[42px] flex justify-between items-center">
                    <div className="w-[30px] h-[30px] bg-gray-100/15 flex items-center justify-center rounded-[5px] shadow-sm">
                        <CiBellOn size={20} />
                    </div>
                    <div className="w-[98px] h-[30px] bg-gray-100/15 flex items-center justify-center rounded-[5px] shadow-sm">
                        <select className="outline-none" name="language" id="language">
                            <option value="english">English</option>
                            <option value="urdu">Urdu</option>
                            <option value="arabic">Arabic</option>
                        </select>
                    </div>
                    <div><img src={Profilelogo} alt="profile" className="w-[42px] h-[42px] rounded-full object-cover" /></div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;