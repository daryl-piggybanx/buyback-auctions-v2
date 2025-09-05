import { createFileRoute } from '@tanstack/react-router'
import { NotificationCenter } from '../components/NotificationCenter'
import { AuthRequired } from '../components/AuthRequired'

export const Route = createFileRoute('/notifications')({
  component: NotificationsPage,
})

function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AuthRequired>
        <NotificationCenter />
      </AuthRequired>
    </div>
  )
}
