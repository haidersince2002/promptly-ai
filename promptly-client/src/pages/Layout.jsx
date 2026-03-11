import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, Moon, Sun, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useUser, SignIn } from '@clerk/clerk-react'
import { useTheme } from '../context/ThemeContext'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const {user} = useUser()
  const { darkMode, toggleDarkMode } = useTheme()
  
  return user ?(
    <div className='flex flex-col items-start justify-start h-screen dark:bg-slate-900'>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 dark:bg-slate-900'>
        <img className='cursor-pointer w-32 sm:w-44' src={assets.logo} alt="" onClick={()=> navigate('/')}/>
        <div className='flex items-center gap-3'>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          {
            sidebar ? <X onClick={()=> setSidebar(false)} className='w-6 h-6 text-gray-600 dark:text-gray-400 sm:hidden'/> : <Menu onClick={()=> setSidebar(true)} className='w-6 h-6 text-gray-600 dark:text-gray-400 sm:hidden'/>
          }
        </div>
      </nav>
      <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
        <div className='flex-1 bg-[#F4F7FB] dark:bg-slate-900'>
        <Outlet/>
        </div>

      </div>

    </div>
  ) :(
    <div className='flex items-center justify-center h-screen dark:bg-slate-900'>
      <SignIn/>
    </div>
  )
}

export default Layout
