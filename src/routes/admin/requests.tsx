import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/requests')({
  component: AdminRequestsLayout,
})

function AdminRequestsLayout() {
  return <Outlet />
}
