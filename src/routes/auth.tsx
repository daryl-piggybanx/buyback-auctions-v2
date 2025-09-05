import { createFileRoute } from '@tanstack/react-router'
import { EnhancedSignIn } from '../components/EnhancedSignIn'
import { Authenticated, Unauthenticated } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()

  return (
    <>
      <Authenticated>
        <AuthenticatedRedirect />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
            <EnhancedSignIn />
          </div>
        </div>
      </Unauthenticated>
    </>
  )
}

function AuthenticatedRedirect() {
  const navigate = useNavigate()
  
  useEffect(() => {
    navigate({ to: '/auctions' })
  }, [navigate])
  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
