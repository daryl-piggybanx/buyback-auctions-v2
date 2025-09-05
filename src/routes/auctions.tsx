import { createFileRoute } from '@tanstack/react-router'
import { AuctionDashboard } from '../components/AuctionDashboard'

export const Route = createFileRoute('/auctions')({
  component: AuctionsPage,
})

function AuctionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AuctionDashboard />
    </div>
  )
}
