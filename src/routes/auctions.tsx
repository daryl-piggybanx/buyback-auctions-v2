import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/auctions')({
  component: RequestsLayout,
})

function RequestsLayout() {
  return <Outlet />
}
