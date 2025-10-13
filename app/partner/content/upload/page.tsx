'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramSummariesForPartner } from '@/lib/programs/selectors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  File, 
  Video, 
  Globe,
  Book,
  Gamepad2,
  Presentation,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
  Plus
} from 'lucide-react'
import Link from 'next/link'

const resourceSchema = z.object({
  title: z.string().min(3, 'Title is required (minimum 3 characters)'),
  description: z.string().min(10, 'Description is required (minimum 10 characters)'),
  type: z.enum(['document', 'video', 'website', 'presentation', 'book', 'game', 'quiz']),
  sdgAlignment: z.array(z.string()).min(1, 'Select at least one SDG'),
  targetAudience: z.array(z.string()).min(1, 'Select at least one audience'),
  language: z.string().min(1, 'Language is required'),
  isPublic: z.boolean(),
  programAssignment: z.enum(['all', 'specific']),
  specificPrograms: z.array(z.string()).optional(),
  file: z.any().optional(),
  url: z.string().url().optional(),
  tags: z.array(z.string()).default([])
})

type ResourceData = z.infer<typeof resourceSchema>

const resourceTypes = [
  { value: 'document', label: 'Document (PDF, Word)', icon: File },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'website', label: 'Website/Link', icon: Globe },
  { value: 'presentation', label: 'Presentation', icon: Presentation },
  { value: 'book', label: 'Book/eBook', icon: Book },
  { value: 'game', label: 'Educational Game', icon: Gamepad2 },
]

const sdgOptions = [
  { id: '1', title: 'No Poverty', color: 'bg-red-500' },
  { id: '2', title: 'Zero Hunger', color: 'bg-yellow-500' },
  { id: '3', title: 'Good Health', color: 'bg-green-500' },
  { id: '4', title: 'Quality Education', color: 'bg-red-600' },
  { id: '5', title: 'Gender Equality', color: 'bg-orange-500' },
  { id: '6', title: 'Clean Water', color: 'bg-blue-400' },
  { id: '7', title: 'Clean Energy', color: 'bg-yellow-600' },
  { id: '8', title: 'Economic Growth', color: 'bg-red-700' },
  { id: '9', title: 'Innovation', color: 'bg-orange-600' },
  { id: '10', title: 'Reduced Inequalities', color: 'bg-pink-500' },
  { id: '11', title: 'Sustainable Cities', color: 'bg-yellow-700' },
  { id: '12', title: 'Responsible Consumption', color: 'bg-green-600' },
  { id: '13', title: 'Climate Action', color: 'bg-green-700' },
  { id: '14', title: 'Life Below Water', color: 'bg-blue-500' },
  { id: '15', title: 'Life on Land', color: 'bg-green-800' },
  { id: '16', title: 'Peace & Justice', color: 'bg-blue-600' },
  { id: '17', title: 'Partnerships', color: 'bg-blue-800' },
]

const audiences = [
  { value: 'primary', label: 'Primary School (Ages 6-11)' },
  { value: 'secondary', label: 'Secondary School (Ages 12-18)' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'parents', label: 'Parents/Families' },
]

const languages = [
  'English', 'Danish', 'Swedish', 'Norwegian', 'German', 'French', 'Spanish', 'Italian', 'Other'
]

export default function UploadContentPage() {
  const [uploadComplete, setUploadComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>([])
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [uploadTab, setUploadTab] = useState('file')
  const [tagInput, setTagInput] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])

  const { ready: prototypeReady, database } = usePrototypeDb()

  // Get partner's programs
  const partnerRecord = useMemo(() => {
    if (!database) return null
    // In a real app, get the actual partner from the session
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database])

  const programSummaries = useMemo(() => {
    if (!prototypeReady || !database || !partnerRecord) {
      return []
    }
    return buildProgramSummariesForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })
  }, [prototypeReady, database, partnerRecord])

  const form = useForm<ResourceData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'document',
      sdgAlignment: [],
      targetAudience: [],
      language: 'English',
      isPublic: false,
      programAssignment: 'all',
      specificPrograms: [],
      tags: []
    },
  })

  const watchType = form.watch('type')
  const isWebsite = watchType === 'website'
  const watchProgramAssignment = form.watch('programAssignment')

  const handleProgramToggle = (programId: string) => {
    const newSelection = selectedPrograms.includes(programId)
      ? selectedPrograms.filter(id => id !== programId)
      : [...selectedPrograms, programId]

    setSelectedPrograms(newSelection)
    form.setValue('specificPrograms', newSelection)
  }

  const handleSDGToggle = (sdgId: string) => {
    const newSelection = selectedSDGs.includes(sdgId)
      ? selectedSDGs.filter(id => id !== sdgId)
      : [...selectedSDGs, sdgId]
    
    setSelectedSDGs(newSelection)
    form.setValue('sdgAlignment', newSelection)
  }

  const handleAudienceToggle = (audience: string) => {
    const newSelection = selectedAudiences.includes(audience)
      ? selectedAudiences.filter(a => a !== audience)
      : [...selectedAudiences, audience]
    
    setSelectedAudiences(newSelection)
    form.setValue('targetAudience', newSelection)
  }

  const addTag = () => {
    if (tagInput.trim() && !customTags.includes(tagInput.trim())) {
      const newTags = [...customTags, tagInput.trim()]
      setCustomTags(newTags)
      form.setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    const newTags = customTags.filter(t => t !== tag)
    setCustomTags(newTags)
    form.setValue('tags', newTags)
  }

  const handleSubmit = async (_data: ResourceData) => {
    setIsLoading(true)
    try {
      // Simulate file upload and processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      setUploadComplete(true)
    } catch (error) {
      console.error('Failed to upload resource:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Resource Uploaded!</h2>
            <p className="text-gray-600 mb-6">
              Your educational resource has been added to your content bank and is now available to your partner schools.
            </p>
            <div className="space-y-2">
              <Link href="/partner/profile?tab=resources">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Back to Resources
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setUploadComplete(false)}>
                Upload More Content
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/partner/profile">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Educational Content</h1>
                <p className="text-gray-600">Share your resources with partner schools</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Upload className="h-4 w-4" />
              <span>Content Bank</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Information</CardTitle>
                <CardDescription>Basic details about your educational resource</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Children's Rights Activity Guide" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select resource type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {resourceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center">
                                  <type.icon className="h-4 w-4 mr-2" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this resource is about, how to use it, and what students will learn..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sharing</label>
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isPublic"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="isPublic" className="text-sm">
                              Share with all Class2Class users (not just partner schools)
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Program Assignment *</CardTitle>
                <CardDescription>
                  Assign this resource to specific programs or make it available to all programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
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
                            setSelectedPrograms([])
                            form.setValue('specificPrograms', [])
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-900">All Programs</div>
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
                              <div className="font-medium text-gray-900">Specific Programs</div>
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
                    <label className="text-sm font-medium text-gray-700">Select Programs *</label>
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
                            onClick={() => handleProgramToggle(program.id)}
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
                        <p className="text-sm text-gray-600">No programs available.</p>
                        <Link href="/partner/programs/create">
                          <Button variant="link" size="sm" className="mt-2">
                            Create your first program
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

            {/* File Upload or URL */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Content</CardTitle>
                <CardDescription>
                  {isWebsite ? 'Provide the URL to your online resource' : 'Upload your file or provide a link'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isWebsite ? (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/educational-resource"
                            type="url"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <Tabs value={uploadTab} onValueChange={setUploadTab}>
                    <TabsList>
                      <TabsTrigger value="file">Upload File</TabsTrigger>
                      <TabsTrigger value="url">Provide Link</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="file" className="mt-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <p className="text-gray-600">Drag and drop your file here, or</p>
                          <Button type="button" variant="outline">
                            Choose File
                          </Button>
                          <p className="text-xs text-gray-500">
                            Max file size: 50MB. Supported: PDF, DOC, DOCX, PPT, PPTX, MP4, etc.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="url" className="mt-4">
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resource URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/your-resource"
                                type="url"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle>Target Audience *</CardTitle>
                <CardDescription>Who is this resource designed for?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audiences.map((audience) => (
                    <div
                      key={audience.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAudiences.includes(audience.value)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                      onClick={() => handleAudienceToggle(audience.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{audience.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedAudiences.includes(audience.value)
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedAudiences.includes(audience.value) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SDG Alignment */}
            <Card>
              <CardHeader>
                <CardTitle>SDG Alignment *</CardTitle>
                <CardDescription>Which UN Sustainable Development Goals does this resource support?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sdgOptions.map((sdg) => (
                    <div
                      key={sdg.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors text-center ${
                        selectedSDGs.includes(sdg.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                      onClick={() => handleSDGToggle(sdg.id)}
                    >
                      <div className={`w-8 h-8 ${sdg.color} rounded text-white text-xs font-bold flex items-center justify-center mx-auto mb-1`}>
                        {sdg.id}
                      </div>
                      <div className="text-xs text-gray-700">{sdg.title}</div>
                    </div>
                  ))}
                </div>
                {selectedSDGs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected SDGs:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSDGs.map(sdgId => {
                        const sdg = sdgOptions.find(s => s.id === sdgId)
                        return sdg ? (
                          <Badge key={sdgId} variant="secondary" className="text-xs">
                            SDG {sdg.id}: {sdg.title}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags (Optional)</CardTitle>
                <CardDescription>Add tags to help teachers find your resource</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a tag (e.g., human rights, democracy, citizenship)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {customTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-4">
              <Link href="/partner/profile?tab=resources" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading || selectedSDGs.length === 0 || selectedAudiences.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resource
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}