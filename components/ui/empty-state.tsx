import { type ReactNode } from 'react'

interface EmptyStateProps {
    icon: ReactNode
    title: string
    description: string
    action?: ReactNode
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
            <div className="rounded-full bg-white p-2 shadow-sm">{icon}</div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 max-w-xs">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}
