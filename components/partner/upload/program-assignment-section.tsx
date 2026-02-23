'use client'

import { useTranslations } from 'next-intl'
import type { Control, UseFormSetValue } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface ProgramSummaryItem {
  program: {
    id: string
    name: string
    displayTitle?: string | null
    status: string
    description?: string | null
  }
}

interface ProgramAssignmentSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
  watchProgramAssignment: string | undefined
  selectedPrograms: string[]
  programSummaries: ProgramSummaryItem[]
  baseProfilePath: string
  onProgramToggle: (programId: string) => void
  onClearPrograms: () => void
}

export function ProgramAssignmentSection({
  control,
  setValue,
  watchProgramAssignment,
  selectedPrograms,
  programSummaries,
  baseProfilePath,
  onProgramToggle,
  onClearPrograms,
}: ProgramAssignmentSectionProps) {
  const t = useTranslations('content')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('programAssignment')} *</CardTitle>
        <CardDescription>
          Assign this resource to specific programs or make it available to all programs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="programAssignment"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    field.value === 'all'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    field.onChange('all')
                    onClearPrograms()
                    setValue('specificPrograms', [])
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{t('allPrograms')}</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Make this resource available across all your programs (e.g., getting started guides, general educational materials)
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        field.value === 'all'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {field.value === 'all' && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    field.value === 'specific'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                  onClick={() => field.onChange('specific')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{t('specificPrograms')}</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Assign to specific programs only (e.g., program-specific activity guides, specialized content)
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        field.value === 'specific'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {field.value === 'specific' && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchProgramAssignment === 'specific' && (
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-gray-700">{t('selectPrograms')} *</label>
            {programSummaries.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {programSummaries.map(({ program }) => (
                  <div
                    key={program.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPrograms.includes(program.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onProgramToggle(program.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {program.displayTitle ?? program.name}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {program.status === 'active' ? 'Active' : 'Inactive'} • {program.description?.substring(0, 60)}...
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ml-3 flex-shrink-0 ${
                          selectedPrograms.includes(program.id)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPrograms.includes(program.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">{t('noPrograms')}</p>
                <Link href={`${baseProfilePath}/programs/create`}>
                  <Button variant="link" size="sm" className="mt-2">
                    {t('createFirstProgram')}
                  </Button>
                </Link>
              </div>
            )}
            {selectedPrograms.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedPrograms.length}</strong> program{selectedPrograms.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
