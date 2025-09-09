import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auctions/$auctionId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auctions/$auctionId"!</div>
}
