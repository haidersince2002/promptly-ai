import { useEffect, useState } from 'react'
import { Gem, Sparkles, Zap } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import axios from "axios";
import toast from 'react-hot-toast'


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('free')
  const {getToken} = useAuth()

  const getDashboardData = async () => {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch plan and creations in parallel
      const [planRes, creationsRes] = await Promise.all([
        axios.get('/api/user/get-user-plan', { headers }),
        axios.get('/api/user/get-user-creations', { headers }),
      ]);

      if (planRes.data.success) {
        setPlan(planRes.data.plan);
      }

      if (creationsRes.data.success) {
        setCreations(creationsRes.data.creations);
      } else {
        toast.error(creationsRes.data.message);
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const handleUpgrade = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load payment gateway.");
      return;
    }

    try {
      const { data } = await axios.post('/api/payments/create-order', {}, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (!data.success) {
        toast.error(data.message || 'Failed to create order');
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Promptly AI",
        description: "Premium Plan — Monthly",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post('/api/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, { headers: { Authorization: `Bearer ${await getToken()}` } });
            if (verifyRes.data.success) {
              toast.success("🎉 You are now Premium!");
              setTimeout(() => window.location.reload(), 1500);
            } else {
              toast.error(verifyRes.data.message);
            }
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        theme: { color: "#5044E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Payment not available. Please configure Razorpay keys.')
    }
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700'>
          <div className='text-slate-600 dark:text-slate-300'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold dark:text-slate-100'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white'/>
          </div>
        </div>

        {/* Active Plan Card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700'>
          <div className='text-slate-600 dark:text-slate-300'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold dark:text-slate-100'>
              {plan === 'premium' ? 'Premium' : 'Free'}
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white'/>
          </div>
        </div>

        {/* Upgrade Card — only show for free users */}
        {plan !== 'premium' && (
          <div className='flex justify-between items-center w-72 p-4 px-6 bg-gradient-to-r from-primary to-[#7c3aed] rounded-xl text-white cursor-pointer hover:scale-[1.02] transition' onClick={handleUpgrade}>
            <div>
              <p className='text-sm opacity-90'>Unlock All Features</p>
              <h2 className='text-xl font-semibold'>Upgrade to Premium</h2>
            </div>
            <div className='w-10 h-10 rounded-lg bg-white/20 flex justify-center items-center'>
              <Zap className='w-5'/>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-3/4">
        <span className="w-11 h-11 rounded-full border-3 border-purple-500 border-t-transparent animate-spin"></span>
      </div>
      ): (
        <div className='space-y-3'>
        <p className='mt-6 mb-4 dark:text-slate-200'>Recent Creations</p>
        {
          creations.map((item) => <CreationItem key={item.id} item={item} onRefresh={getDashboardData}/>)
        }
      </div>
      )}
      
    </div>
  )
}

export default Dashboard
