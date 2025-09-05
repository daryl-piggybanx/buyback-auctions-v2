import { createFileRoute } from '@tanstack/react-router'
import { AdminRequestsManagement } from '~/components/admin/AdminRequestsManagement'
import { AuthRequired } from '~/components/auth/AuthRequired'

export const Route = createFileRoute('/admin/requests/')({
  component: AdminRequestsPage,
})

function AdminRequestsPage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <AuthRequired>
        <AdminRequestsManagement />
      </AuthRequired>
    </div>
  )
}
