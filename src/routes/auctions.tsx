import { createFileRoute } from '@tanstack/react-router'
import { AuctionDashboard } from '~/components/AuctionDashboard'

export const Route = createFileRoute('/auctions')({
  component: AuctionsPage,
})

function AuctionsPage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <AuctionDashboard />
    </div>
  )
}
