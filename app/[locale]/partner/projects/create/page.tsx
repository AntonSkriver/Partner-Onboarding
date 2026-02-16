'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Rocket, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { Link } from '@/i18n/navigation'

const projectSchema = z.object({
  title: z.string().min(5, 'Project title is required (minimum 5 characters)'),
  description: z.string().min(50, 'Description is required (minimum 50 characters)'),
  objectives: z.string().min(30, 'Learning objectives are required (minimum 30 characters)'),
  projectType: z.enum(['hosted', 'template']),
  collaborationTheme: z.enum(['explore_global', 'explore_cultures', 'explore_solutions']),
  targetAudience: z.enum(['primary', 'secondary', 'both']),
  sdgAlignment: z.array(z.string()).min(1, 'Select at least one SDG'),
  maxSchools: z.number().min(2).max(20).optional(),
  duration: z.string().min(1, 'Duration is required'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  activities: z.string().min(30, 'Project activities description is required'),
  resources: z.string().optional(),
  expectedOutcomes: z.string().min(20, 'Expected outcomes are required'),
})

type ProjectData = z.infer<typeof projectSchema>

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

const languages = [
  'English', 'Danish', 'Swedish', 'Norwegian', 'German', 'French', 'Spanish', 'Italian', 'Dutch'
]

const collaborationThemes = [
  {
    value: 'explore_global',
    title: 'Explore Global',
    description: 'Investigate world challenges together.',
  },
  {
    value: 'explore_cultures',
    title: 'Explore Cultures',
    description: 'Share identities, traditions, and lived experiences.',
  },
  {
    value: 'explore_solutions',
    title: 'Explore Solutions',
    description: 'Design and test ideas to solve real problems.',
  },
] as const

const durations = [
  '1 week', '2 weeks', '1 month', '6 weeks', '2 months', '3 months', '6 months', '1 year'
]

export default function CreateProjectPage() {
  const [projectCreated, setProjectCreated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English'])
  const [useAI, setUseAI] = useState(false)

  const form = useForm<ProjectData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      objectives: '',
      projectType: 'hosted',
      collaborationTheme: 'explore_global',
      targetAudience: 'both',
      sdgAlignment: [],
      maxSchools: 5,
      duration: '1 month',
      languages: ['English'],
      activities: '',
      resources: '',
      expectedOutcomes: ''
    },
  })

  const watchProjectType = form.watch('projectType')
  const isHosted = watchProjectType === 'hosted'

  const handleSDGToggle = (sdgId: string) => {
    const newSelection = selectedSDGs.includes(sdgId)
      ? selectedSDGs.filter(id => id !== sdgId)
      : [...selectedSDGs, sdgId]
    
    setSelectedSDGs(newSelection)
    form.setValue('sdgAlignment', newSelection)
  }

  const handleLanguageToggle = (language: string) => {
    const newSelection = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language]
    
    if (newSelection.length > 0) {
      setSelectedLanguages(newSelection)
      form.setValue('languages', newSelection)
    }
  }

  const generateAISuggestions = async () => {
    setUseAI(true)
    setIsLoading(true)
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock AI suggestions based on UNICEF context
      const suggestions = {
        title: "Children's Rights Across Cultures",
        description: "A collaborative project exploring how children's rights are understood and protected in different countries. Students will research, share experiences, and create presentations about children's rights in their communities, fostering global citizenship and awareness of the UN Convention on the Rights of the Child.",
        objectives: "Students will understand the universal nature of children's rights, compare how rights are protected in different countries, develop empathy and global awareness, and create advocacy materials for children's rights in their communities.",
        activities: "Week 1: Introduction to UN Convention on Rights of the Child and country research. Week 2: Students create presentations about children's rights in their country. Week 3: Virtual exchanges between classrooms to share findings. Week 4: Collaborative creation of a global children's rights charter and advocacy campaign.",
        resources: "UN Convention on Rights of the Child materials, UNICEF country reports, video conferencing tools for virtual exchanges, presentation templates, and advocacy toolkit materials.",
        expectedOutcomes: "Students gain deep understanding of children's rights globally, develop cross-cultural communication skills, create actionable advocacy materials, and build lasting connections with peers from other countries."
      }
      
      // Store suggestions for potential future use
      
      // Pre-fill form with AI suggestions
      form.setValue('title', suggestions.title)
      form.setValue('description', suggestions.description)
      form.setValue('objectives', suggestions.objectives)
      form.setValue('activities', suggestions.activities)
      form.setValue('resources', suggestions.resources)
      form.setValue('expectedOutcomes', suggestions.expectedOutcomes)
      
      // Auto-select relevant SDGs
      const relevantSDGs = ['4', '10', '16'] // Education, Reduced Inequalities, Peace & Justice
      setSelectedSDGs(relevantSDGs)
      form.setValue('sdgAlignment', relevantSDGs)
      
    } catch (error) {
      console.error('AI generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (_data: ProjectData) => {
    setIsLoading(true)
    try {
      // Simulate project creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      setProjectCreated(true)
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (projectCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Created!</h2>
            <p className="text-gray-600 mb-6">
              Your collaborative project has been created successfully. 
              {isHosted ? ' Schools can now discover and join your project.' : ' Teachers can now use your project template.'}
            </p>
            <div className="space-y-2">
              <Link href="/partner/dashboard">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Back to Dashboard
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setProjectCreated(false)}>
                Create Another Project
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
              <Link href="/partner/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Collaborative Project</h1>
                <p className="text-gray-600">Design a project that connects classrooms worldwide</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Rocket className="h-4 w-4" />
              <span>UNICEF Denmark</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* AI Assistant */}
        {!useAI && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Project Assistant</h3>
                    <p className="text-sm text-gray-600">Let our AI help you create a comprehensive project plan</p>
                  </div>
                </div>
                <Button 
                  onClick={generateAISuggestions}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Project Type */}
            <Card>
              <CardHeader>
                <CardTitle>Project Type</CardTitle>
                <CardDescription>Choose how you want to engage with this project</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="hosted" id="hosted" />
                          <div className="flex-1">
                            <label htmlFor="hosted" className="font-medium cursor-pointer">
                              Host a Project
                            </label>
                            <p className="text-sm text-gray-600">
                              You&apos;ll actively facilitate this project and collaborate directly with participating schools
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="template" id="template" />
                          <div className="flex-1">
                            <label htmlFor="template" className="font-medium cursor-pointer">
                              Create Template
                            </label>
                            <p className="text-sm text-gray-600">
                              Share a project idea that teachers can adapt and run independently
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Basic details about your collaborative project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Children's Rights Across Cultures" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this project is about, what students will do, and what makes it special..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collaborationTheme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collaboration Theme *</FormLabel>
                      <p className="text-sm text-gray-600 mb-3">
                        This label appears on project cards (e.g. Explore Cultures or Explore Solutions).
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {collaborationThemes.map((theme) => {
                          const isActive = field.value === theme.value
                          return (
                            <button
                              type="button"
                              key={theme.value}
                              onClick={() => field.onChange(theme.value)}
                              className={`w-full text-left rounded-lg border p-3 transition-all ${
                                isActive
                                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <p className="text-sm font-semibold text-gray-900">{theme.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{theme.description}</p>
                            </button>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Objectives *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What will students learn and achieve through this project?"
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
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">Primary School (Ages 6-11)</SelectItem>
                            <SelectItem value="secondary">Secondary School (Ages 12-18)</SelectItem>
                            <SelectItem value="both">Both Primary & Secondary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Duration *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durations.map((duration) => (
                              <SelectItem key={duration} value={duration}>
                                {duration}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isHosted && (
                  <FormField
                    control={form.control}
                    name="maxSchools"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Number of Schools</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="2" 
                            max="20"
                            placeholder="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Project Languages *</CardTitle>
                <CardDescription>In which languages will this project be conducted?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languages.map((language) => (
                    <div
                      key={language}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedLanguages.includes(language)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => handleLanguageToggle(language)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{language}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedLanguages.includes(language)
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedLanguages.includes(language) && (
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
                <CardDescription>Which UN Sustainable Development Goals does this project support?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sdgOptions.map((sdg) => (
                    <div
                      key={sdg.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors text-center ${
                        selectedSDGs.includes(sdg.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
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

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Plan</CardTitle>
                <CardDescription>Detailed information about how the project will work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="activities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Activities *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the specific activities, timeline, and how students will collaborate..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Resources (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What materials, tools, or resources will schools need to participate?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedOutcomes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Outcomes *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What will students have accomplished by the end of this project?"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isHosted 
                  ? "As a hosted project, you&apos;ll be responsible for facilitating collaboration between participating schools and guiding the project activities."
                  : "As a project template, teachers will be able to adapt your project idea to their specific classroom needs and curriculum requirements."
                }
              </AlertDescription>
            </Alert>

            <div className="flex gap-4 pt-4">
              <Link href="/partner/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading || selectedSDGs.length === 0 || selectedLanguages.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    {isHosted ? 'Launch Project' : 'Publish Template'}
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
