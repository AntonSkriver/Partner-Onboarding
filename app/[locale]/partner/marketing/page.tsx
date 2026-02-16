'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, FileText, Share2, Download, Eye, Edit3, 
  Globe, Facebook, Twitter, Instagram, Mail, 
  School, Users, Target, Sparkles, ArrowLeft
} from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function MarketingCampaign() {
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedProject, setUploadedProject] = useState(null)

  const contentTypes = [
    {
      id: "blog_post",
      title: "Blog Post",
      description: "Professional blog post for school website or newsletter",
      icon: FileText,
      template: "project_summary"
    },
    {
      id: "social_media",
      title: "Social Media Posts",
      description: "Engaging posts for Facebook, Twitter, Instagram",
      icon: Share2,
      template: "social_content"
    },
    {
      id: "newsletter",
      title: "Newsletter Content",
      description: "Ready-to-use content for parent newsletters",
      icon: Mail,
      template: "newsletter_section"
    },
    {
      id: "presentation",
      title: "Presentation Slides",
      description: "PowerPoint slides for school assemblies or meetings",
      icon: Target,
      template: "presentation_slides"
    }
  ]

  const generatedContent = {
    blog_post: {
      title: "Class 7A's Global Collaboration: Learning About Community Well-being with Nepal",
      content: `Our students recently completed an inspiring international collaboration project with a school in Nepal, exploring community well-being initiatives from different cultural perspectives.

## What the Project Involved
Over 6 weeks, our Class 7A worked alongside students from Himalayan International School in Kathmandu to compare and contrast community well-being approaches in Denmark and Nepal. Students researched local initiatives, interviewed community members, and shared their findings through video calls and digital presentations.

## Key Learning Outcomes
• **Global Citizenship**: Students developed understanding of how different communities address similar challenges
• **Cultural Awareness**: Learned about Nepali culture, traditions, and social structures
• **Critical Thinking**: Analyzed effectiveness of different community programs
• **Digital Collaboration**: Used technology to connect across continents

## Student Reflections
"I never knew that in Nepal, they have community gardens just like we do, but they use different plants and methods!" - Emma, Class 7A

"The students in Nepal taught us about their water conservation projects. We want to start something similar here." - Marcus, Class 7A

## Impact on Our School Community
This project has inspired our school to start a new initiative connecting with international partners. We're planning to implement some of the sustainability practices we learned about and continue our partnership next semester.

*This project was made possible through our partnership with UNICEF Denmark's Global Education Initiative.*`
    },
    social_media: {
      facebook: "🌍 Amazing news! Our Class 7A just completed an incredible collaboration with students in Nepal! They learned about community well-being initiatives and discovered how young people worldwide are making a difference. So proud of our global citizens! #GlobalEducation #UNICEFPartnership #StudentCollaboration",
      twitter: "🏫 Class 7A collaborated with Nepali students to explore community well-being! Key learnings: different approaches, same passion for making a difference 🌟 #GlobalLearning #StudentVoices",
      instagram: "📚✨ When Danish and Nepali students come together to learn about community well-being... magic happens! Swipe to see their amazing project outcomes 👆 #GlobalClassroom #StudentCollaboration #LearningWithoutBorders"
    },
    newsletter: {
      title: "International Learning: Class 7A Connects with Nepal",
      content: `Dear Parents,

We're excited to share that Class 7A has successfully completed a meaningful international collaboration project! Over the past 6 weeks, our students worked with peers from Himalayan International School in Nepal to explore community well-being initiatives.

**What Your Children Learned:**
- How different communities address similar challenges
- Cultural awareness and global citizenship skills  
- The importance of international cooperation
- Digital collaboration and communication skills

**Next Steps:**
The students are so inspired by this experience that they've proposed starting a school sustainability initiative based on what they learned from their Nepali partners. We'll be organizing a presentation evening where students can share their discoveries with the school community.

Thank you for supporting these enriching learning opportunities that help our students become truly global citizens.

Best regards,
The Class 7A Teaching Team`
    }
  }

  const handleProjectUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedProject({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/partner/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketing Campaign Center</h1>
              <p className="text-gray-600">Share your project outcomes with the world</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Content Sharing Tools
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 data-[state=active]:shadow-sm"
            >
              1. Upload Project
            </TabsTrigger>
            <TabsTrigger 
              value="generate"
              className="data-[state=active]:bg-purple-400 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              2. Generate Content
            </TabsTrigger>
            <TabsTrigger 
              value="share"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              3. Share & Distribute
            </TabsTrigger>
          </TabsList>

          {/* Upload Project Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Your Project Results
                </CardTitle>
                <CardDescription>
                  Upload project documentation, student work samples, photos, or outcome reports to generate marketing content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drop your project files here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Support for documents, images, presentations, and project reports
                  </p>
                  <input
                    type="file"
                    onChange={handleProjectUpload}
                    className="hidden"
                    id="project-upload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                  />
                  <label htmlFor="project-upload">
                    <Button className="cursor-pointer">
                      Choose Files
                    </Button>
                  </label>
                </div>

                {/* Uploaded File Display */}
                {uploadedProject && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">{uploadedProject.name}</p>
                            <p className="text-sm text-green-700">
                              {(uploadedProject.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manual Input Option */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Or describe your project manually:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title
                      </label>
                      <Input placeholder="e.g., Global Rights Education Collaboration" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner School/Country
                      </label>
                      <Input placeholder="e.g., Himalayan International School, Nepal" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description & Outcomes
                    </label>
                    <Textarea 
                      placeholder="Describe what students did, what they learned, key outcomes, and any notable achievements..."
                      className="min-h-32"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Students Involved
                      </label>
                      <Input placeholder="e.g., 28" type="number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <Input placeholder="e.g., 6 weeks" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Areas
                      </label>
                      <Input placeholder="e.g., Social Studies, Geography" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setActiveTab("generate")}
                  className="w-full bg-purple-200 hover:bg-purple-300 text-purple-800"
                  disabled={!uploadedProject}
                >
                  Continue to Content Generation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Generate Content Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI-Powered Content Generation
                </CardTitle>
                <CardDescription>
                  Choose what type of marketing content you'd like to generate from your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {contentTypes.map((type) => (
                    <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow border-purple-200">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <type.icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{type.title}</CardTitle>
                            <CardDescription className="text-sm">{type.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          Generate {type.title}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generated Content Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Content Preview</CardTitle>
                <CardDescription>
                  Review and edit your generated content before sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="blog" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="blog">Blog Post</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="blog" className="space-y-4">
                    <div className="border rounded-lg p-4 bg-white">
                      <h3 className="font-bold text-lg mb-4">{generatedContent.blog_post.title}</h3>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {generatedContent.blog_post.content}
                        </pre>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Content
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download as Word Doc
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex items-center mb-2">
                          <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium">Facebook Post</span>
                        </div>
                        <p className="text-sm">{generatedContent.social_media.facebook}</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-sky-50">
                        <div className="flex items-center mb-2">
                          <Twitter className="h-5 w-5 text-sky-600 mr-2" />
                          <span className="font-medium">Twitter Post</span>
                        </div>
                        <p className="text-sm">{generatedContent.social_media.twitter}</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-pink-50">
                        <div className="flex items-center mb-2">
                          <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                          <span className="font-medium">Instagram Caption</span>
                        </div>
                        <p className="text-sm">{generatedContent.social_media.instagram}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="newsletter" className="space-y-4">
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-bold mb-3">{generatedContent.newsletter.title}</h4>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {generatedContent.newsletter.content}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setActiveTab("share")}
                  className="w-full bg-purple-400 hover:bg-purple-500 text-white"
                >
                  Continue to Sharing Options
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Share & Distribute Tab */}
          <TabsContent value="share" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Your Success Story
                </CardTitle>
                <CardDescription>
                  Distribute your content across multiple channels to maximize impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sharing Options */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-8 w-8 text-green-600" />
                        <div>
                          <CardTitle className="text-lg">School Website</CardTitle>
                          <CardDescription>Add to your school's news section</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Copy HTML Code
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-8 w-8 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">Parent Newsletter</CardTitle>
                          <CardDescription>Ready-to-use newsletter content</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Export for Newsletter
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-purple-600" />
                        <div>
                          <CardTitle className="text-lg">Social Media</CardTitle>
                          <CardDescription>Share across social platforms</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Schedule Posts
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <School className="h-8 w-8 text-orange-600" />
                        <div>
                          <CardTitle className="text-lg">School Community</CardTitle>
                          <CardDescription>Internal communications</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Send to Staff
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Success Metrics */}
                <Card className="bg-gradient-to-r from-purple-100 to-indigo-100">
                  <CardHeader>
                    <CardTitle>Campaign Impact Tracking</CardTitle>
                    <CardDescription>
                      Track how your content performs across different channels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600">Views</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600">Shares</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600">Downloads</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600">Inquiries</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}