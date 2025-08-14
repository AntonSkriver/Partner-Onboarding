import { redirect } from "next/navigation"
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { ArrowRightIcon as ArrowRightSolid } from '@heroicons/react/24/solid'

export default function Home() {
  redirect("/onboarding")
}

