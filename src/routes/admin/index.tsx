import { createFileRoute } from '@tanstack/react-router'
import { AdminPanel } from '../../components/AdminPanel'
import { AuthRequired } from '../../components/AuthRequired'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AuthRequired>
        <AdminPanel />
      </AuthRequired>
    </div>
  )
}
