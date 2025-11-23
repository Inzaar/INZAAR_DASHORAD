import LogoImg from "../../../assets/icons/logo.png"

function Logo() {
  return (
    <div className='w-[319px] h-[108px] flex items-center absolute left-[150px] top-[110px]'>
      <img src={LogoImg} alt="Inzaar Logo" className='w-[120px] h-[108px]'/>
      <p className='w-[199px] h-[46px] font-[900] text-[34px] text-white'>Inzaar.org</p>
    </div>
  )
}

export default Logo
