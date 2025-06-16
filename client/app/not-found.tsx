import { Button } from "@/components/ui/button";
import { Rocket, Users, Home, Smile } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-blue-200 rounded-full opacity-75 animate-pulse"></div>
          <div className="relative bg-white p-8 rounded-full shadow-lg">
            <div className="text-9xl font-bold text-indigo-600">404</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Lost in the digital cosmos</h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/explore">
              <Rocket className="h-4 w-4" />
              Explore Content
            </Link>
          </Button>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative">
            <Users className="h-16 w-16 text-indigo-400" />
            <Smile className="absolute -right-2 -bottom-2 h-6 w-6 text-yellow-400" />
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Still lost? Try these:</p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Link href="/help" className="hover:text-indigo-600 hover:underline">Help Center</Link>
            <Link href="/contact" className="hover:text-indigo-600 hover:underline">Contact Support</Link>
            <Link href="/status" className="hover:text-indigo-600 hover:underline">System Status</Link>
          </div>
        </div>
      </div>
    </div>
  );
}