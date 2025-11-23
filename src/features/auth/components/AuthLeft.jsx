import Rectangle1 from '../../../assets/icons/rectangle1.png';
import Reactangle2 from '../../../assets/icons/rectangle2.png';
import Rectangle3 from '../../../assets/icons/rectangle3.png';
import Rectangle4 from '../../../assets/icons/rectangle4.png';
import Logo from './Logo';

function AuthLeft() {
  return (
    <div className=' max-w-[662px] w-[50%] h-full bg-gradient-to-bl rounded-bl-2xl rounded-tl-2xl from-[#B666E7] via-[#7F60EA] to-[#3758EE] relative overflow-hidden max-[960px]:hidden'>
        
        <img src={Rectangle1} alt="rectangle 1" className='w-[239px] h-[150px] mt-10 ml-10 absolute left-0 top-0'/>
        <Logo />
        {/* <div className='w-[239px] h-[239px] bg-gradient-to-r from-[#D9D9D9BF]/75 to-[#D9D9D933]/20 -rotate-[100deg] rounded-[43px] absolute -top-[145px] -left-[62px]'></div> */}
        <img src={Reactangle2} alt="rectangle 2" className='w-[104px] h-[104px] mt-10 ml-20 absolute left-[420px] top-[300px]'/>
        <img src={Rectangle3} alt="rectangle 3" className='w-[221px] h-[221px] mt-10 ml-10 absolute bottom-0 left-0'/>
        <img src={Rectangle4} alt="rectangle 4" className='w-[240px] h-[240px] mt-10 ml-20 absolute bottom-0 left-[490px]'/>

    </div>
  )
}

export default AuthLeft
