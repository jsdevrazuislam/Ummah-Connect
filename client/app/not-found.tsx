import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, ArrowLeft, Users, MessageCircle } from "lucide-react"

export default function NotFound() {


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12 text-center space-y-8">
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold text-primary/20 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-primary/60" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Oops! Page Not Found</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              The page you're looking for seems to have wandered off into the digital void. Don't worry, even the best
              explorers get lost sometimes!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Posts
              </Link>
            </Button>
          </div>

          <div className="pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">Or try one of these popular sections:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/feed" className="flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" />
                  Feed
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/discover" className="flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  Discover
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile" className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Profile
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Link href='/'>
              <Button
                variant="link"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go back to previous page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
