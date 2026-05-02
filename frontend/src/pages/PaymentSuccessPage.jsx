import { CheckCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export default function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const tranId = params.get('tran_id')
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-10 text-center max-w-md w-full">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="font-heading font-bold text-3xl text-gray-800 mb-3">Payment Successful!</h1>
        <p className="text-gray-500 mb-2">Your payment was successful.</p>
        <p className="text-gray-500 mb-6">You have been enrolled in the course.</p>
        {tranId && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-400">Transaction ID</p>
            <p className="font-mono font-bold text-gray-700">{tranId}</p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary">My Dashboard</Link>
          <Link to="/courses" className="btn-outline">Browse Courses</Link>
        </div>
      </div>
    </div>
  )
}