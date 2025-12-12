import { PartnerShell } from '@/components/partner/partner-shell'

export default function PartnerProgramsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <PartnerShell>{children}</PartnerShell>
}
