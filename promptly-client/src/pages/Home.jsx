import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonial from '../components/Testimonial'
import Plan from '../components/Plan'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className='min-h-screen dark:bg-slate-900'>
      <Navbar/>
      <Hero/>
      <AiTools/>
      <Plan/>
      <Testimonial/>
      <Footer/>
    </div>
  )
}

export default Home
