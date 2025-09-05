import { createFileRoute } from '@tanstack/react-router'
import { NotificationCenter } from '~/components/NotificationCenter'
import { AuthRequired } from '~/components/auth/AuthRequired'

export const Route = createFileRoute('/notifications')({
  component: NotificationsPage,
})

function NotificationsPage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-4xl">
      <AuthRequired>
        <NotificationCenter />
      </AuthRequired>
    </div>
  )
}
