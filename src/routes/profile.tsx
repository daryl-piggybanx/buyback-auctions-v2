import { createFileRoute } from '@tanstack/react-router'
import { UserProfile } from '../components/UserProfile'
import { AuthRequired } from '../components/AuthRequired'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AuthRequired>
        <UserProfile />
      </AuthRequired>
    </div>
  )
}
