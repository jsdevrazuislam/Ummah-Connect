import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AIContentGenerator } from "@/components/ai-content-generator"
import { AIPrayerReminder } from "@/components/ai-prayer-reminder"
import { AIContentRecommendations } from "@/components/ai-content-recommendations"
import { Bot, Sparkles, Globe, Shield } from "lucide-react"

export default function AIFeaturesPage() {
  return (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">AI Features</h1>
          <p className="text-muted-foreground mb-6">Discover how AI enhances your experience on Ummah Connect</p>

          <Tabs defaultValue="assistant" className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="assistant" className="flex-1">
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="content" className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Content Generation
              </TabsTrigger>
              <TabsTrigger value="translation" className="flex-1">
                <Globe className="h-4 w-4 mr-2" />
                Translation
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Moderation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assistant" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nur - Islamic AI Assistant</CardTitle>
                  <CardDescription>Your personal AI assistant for Islamic knowledge and app guidance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Features</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Ask questions about Islamic teachings and practices</li>
                        <li>Get help navigating the app and using features</li>
                        <li>Receive personalized recommendations</li>
                        <li>Available 24/7 for instant assistance</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Example Questions</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>"How do I calculate zakat?"</li>
                        <li>"What does the Quran say about patience?"</li>
                        <li>"How do I find prayer times in the app?"</li>
                        <li>"Can you recommend Islamic books for beginners?"</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Privacy Note:</strong> Your conversations with Nur are private and used only to improve
                      the assistant's responses. We prioritize your privacy and adhere to Islamic ethical standards.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AIPrayerReminder />
                <AIContentRecommendations />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Generation</CardTitle>
                  <CardDescription>Create Islamic content with AI assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <AIContentGenerator />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>Understanding our AI content generation process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Content Types</h3>
                    <p className="text-sm">
                      Our AI can help you generate posts, duas (supplications), and Islamic quotes based on topics you
                      provide. All content is crafted to align with Islamic values and teachings.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Islamic Verification</h3>
                    <p className="text-sm">
                      All AI-generated content is designed to be respectful of Islamic principles. However, we recommend
                      reviewing generated content before posting, especially for religious accuracy.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Personalization</h3>
                    <p className="text-sm">
                      The more you use our AI content generator, the better it becomes at understanding your style and
                      preferences, creating more personalized content over time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="translation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Translation</CardTitle>
                  <CardDescription>Break language barriers in the Muslim community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Supported Languages</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Arabic</li>
                        <li>Urdu</li>
                        <li>Turkish</li>
                        <li>Malay</li>
                        <li>Indonesian</li>
                        <li>Bengali</li>
                        <li>English</li>
                        <li>French</li>
                        <li>Spanish</li>
                        <li>And more...</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Translation Features</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Translate posts and comments</li>
                        <li>Translate private messages</li>
                        <li>Translate group content</li>
                        <li>Automatic language detection</li>
                        <li>Preserve Islamic terminology</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      Our translation system is specially designed to handle Islamic terminology correctly, preserving
                      words like "Allah," "Quran," "Hadith," and other important terms across all languages.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Impact</CardTitle>
                  <CardDescription>How AI translation unites the global Ummah</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    By breaking down language barriers, our AI translation helps Muslims from different linguistic
                    backgrounds connect, share knowledge, and support each other. This feature is especially valuable
                    for international Islamic events, educational content, and cross-cultural dialogue within our
                    community.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Moderation</CardTitle>
                  <CardDescription>Maintaining a respectful Islamic digital environment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">How It Works</h3>
                    <p className="text-sm">
                      Our AI moderation system reviews content to ensure it aligns with Islamic values and community
                      guidelines. It identifies potentially inappropriate content while respecting diverse Islamic
                      perspectives.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">What We Monitor</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Disrespectful content about Islam</li>
                        <li>Harmful or hateful speech</li>
                        <li>Inappropriate images</li>
                        <li>Misinformation about Islamic teachings</li>
                        <li>Divisive sectarian content</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Human Oversight</h3>
                      <p className="text-sm">
                        While AI helps identify potential issues, human moderators make the final decisions. This
                        ensures cultural nuance and context are properly considered.
                      </p>
                      <p className="text-sm mt-2">
                        Our moderation team includes scholars and experts from diverse Islamic backgrounds.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Guidelines</CardTitle>
                  <CardDescription>Our shared values for a positive Islamic online space</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      <strong>Respect:</strong> Treat all members with kindness and respect, regardless of background or
                      school of thought.
                    </li>
                    <li>
                      <strong>Authenticity:</strong> Share reliable information, especially when discussing Islamic
                      teachings.
                    </li>
                    <li>
                      <strong>Unity:</strong> Focus on what unites Muslims rather than divisive topics.
                    </li>
                    <li>
                      <strong>Privacy:</strong> Respect others' privacy and personal boundaries.
                    </li>
                    <li>
                      <strong>Constructive Dialogue:</strong> Engage in thoughtful, respectful conversations even when
                      disagreeing.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
  )
}
