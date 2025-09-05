import { createFileRoute } from '@tanstack/react-router'
import { AdminRequestsManagement } from '../../../components/AdminRequestsManagement'
import { AuthRequired } from '../../../components/AuthRequired'

export const Route = createFileRoute('/admin/requests/')({
  component: AdminRequestsPage,
})

function AdminRequestsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AuthRequired>
        <AdminRequestsManagement />
      </AuthRequired>
    </div>
  )
}
