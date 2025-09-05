import { createFileRoute } from '@tanstack/react-router'
import { UserProfile } from '~/components/UserProfile'
import { AuthRequired } from '~/components/auth/AuthRequired'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-4xl">
      <AuthRequired>
        <UserProfile />
      </AuthRequired>
    </div>
  )
}
