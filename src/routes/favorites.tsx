import { createFileRoute } from '@tanstack/react-router'
import { FavoritesView } from '~/components/FavoritesView'
import { AuthRequired } from '~/components/auth/AuthRequired'

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
})

function FavoritesPage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <AuthRequired>
        <FavoritesView />
      </AuthRequired>
    </div>
  )
}
