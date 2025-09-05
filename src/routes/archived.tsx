// This file has been moved to src/routes/archive.tsx
// Keeping this file for backwards compatibility - it will redirect
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/archived')({
  beforeLoad: () => {
    throw redirect({
      to: '/archive',
    })
  },
})
