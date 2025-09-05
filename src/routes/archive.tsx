import { createFileRoute } from '@tanstack/react-router'
import { ArchivedAuctionsView } from '~/components/ArchivedAuctionsView'

export const Route = createFileRoute('/archive')({
  component: ArchivePage,
})

function ArchivePage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <ArchivedAuctionsView />
    </div>
  )
}
