import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/requests')({
  component: RequestsLayout,
})

function RequestsLayout() {
  return <Outlet />
}
