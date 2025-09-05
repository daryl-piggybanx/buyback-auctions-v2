import { createFileRoute } from '@tanstack/react-router'
import { AdminPanel } from '~/components/admin/AdminPanel'
import { AuthRequired } from '~/components/auth/AuthRequired'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <AuthRequired>
        <AdminPanel />
      </AuthRequired>
    </div>
  )
}
