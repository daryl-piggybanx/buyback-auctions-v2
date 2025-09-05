import { createFileRoute } from '@tanstack/react-router'
import { ArchivedAuctionsView } from '../components/ArchivedAuctionsView'

export const Route = createFileRoute('/archive')({
  component: ArchivePage,
})

function ArchivePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ArchivedAuctionsView />
    </div>
  )
}
