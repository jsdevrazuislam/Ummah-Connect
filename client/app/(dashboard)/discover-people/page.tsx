"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import PeopleLoading from "@/app/(dashboard)/discover-people/loading";
import { ErrorMessage } from "@/components/api-error";
import FollowButton from "@/components/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { explorePeoples } from "@/lib/apis/auth";
import { cn } from "@/lib/utils";

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedInterest, setSelectedInterest] = useState("all");
  const [selectedProfession, setSelectedProfession] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: discoverData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "discover_peoples",
      currentPage,
      searchQuery,
      selectedLocation,
      selectedInterest,
      selectedProfession,
    ],
    queryFn: () =>
      explorePeoples({
        page: currentPage,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedLocation !== "all" && { location: selectedLocation }),
        ...(selectedInterest !== "all" && { interests: [selectedInterest] }),
        ...(selectedProfession !== "all" && { title: selectedProfession }),
      }),
    staleTime: 1000 * 60 * 5,
  });

  const users = useMemo(
    () => discoverData?.data?.users ?? [],
    [discoverData],
  );

  const totalPages = useMemo(
    () => discoverData?.data?.totalPages ?? 0,
    [discoverData],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("all");
    setSelectedInterest("all");
    setSelectedProfession("all");
    setCurrentPage(1);
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center mt-10">
        <ErrorMessage type="network" />
      </div>
    );
  }

  if (isLoading)
    return <PeopleLoading />;

  const UserCard = ({ user }: { user: PeopleEntry }) => (
    <Card className="group hover:shadow-xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 hover:scale-[1.02] cursor-pointer">
      <CardContent className="p-0">
        {
          user.cover
            ? (
                <div className="h-20 relative overflow-hidden">
                  <Image src={user.cover} alt={user.fullName} width={300} height={80} className="w-full h-full" />
                </div>
              )
            : (
                <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
                </div>
              )
        }

        <div className="px-6 pb-6 -mt-10 relative">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                {user.avatar
                  ? <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
                  : (
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg">
                        {user.fullName?.charAt(0)}
                      </AvatarFallback>
                    )}
              </Avatar>
              {user.verifiedIdentity && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 ring-2 ring-white dark:ring-gray-800">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user.fullName}</h3>
            </div>
            <p className="text-primary font-medium text-sm">
              @
              {user.username}
            </p>
            {user.title && <p className="text-muted-foreground text-sm mt-1">{user.title}</p>}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>

          <div className={cn(`flex items-center justify-center gap-4 text-xs text-muted-foreground`, { "mb-4": user.location && user?.dob })}>
            {
              user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
                </div>
              )
            }
            {user.dob && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {user.dob}
                  {" "}
                  years old
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 text-sm mb-4">
            <div className="text-center">
              <div className="font-bold text-gray-900 dark:text-white">{user?.followersCount}</div>
              <div className="text-muted-foreground text-xs">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 dark:text-white">{user?.followingCount}</div>
              <div className="text-muted-foreground text-xs">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 dark:text-white">{user?.postsCount}</div>
              <div className="text-muted-foreground text-xs">Posts</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {user?.interests?.slice(0, 3).map((interest, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                {interest}
              </Badge>
            ))}
            {user?.interests?.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                +
                {user.interests.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex justify-center items-center gap-2">
            <Link href={`/${user?.username}`}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 bg-transparent"
              >
                View Profile
              </Button>
            </Link>
            <FollowButton isFollowing={user?.isFollowing} id={user?.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const Pagination = () => (
    <div className="flex items-center justify-between mt-8">
      <div className="text-sm text-muted-foreground">
        Showing
        {" "}
        {currentPage}
        -
        10
        {" "}
        of
        {totalPages}
        {" "}
        people
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            }
            else if (currentPage <= 3) {
              pageNum = i + 1;
            }
            else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            }
            else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="h-9 w-9"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Discover People
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Connect with fellow Muslims around the world. Build meaningful relationships and grow your community through
            shared values and interests.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search by name, username, bio, or profession..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base border-gray-200 dark:border-gray-700 rounded-2xl"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(selectedLocation !== "all" || selectedInterest !== "all" || selectedProfession !== "all") && (
                  <Badge className="ml-2 h-5 w-5 p-0 text-xs">!</Badge>
                )}
              </Button>

              {(searchQuery
                || selectedLocation !== "all"
                || selectedInterest !== "all"
                || selectedProfession !== "all") && (
                <Button variant="ghost" onClick={clearFilters} className="h-10">
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Egypt">Egypt</SelectItem>
                    <SelectItem value="Turkey">Turkey</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                    <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                    <SelectItem value="UAE">UAE</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Morocco">Morocco</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Pakistan">Pakistan</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Professions</SelectItem>
                    <SelectItem value="Scholar">Islamic Scholar</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Nutritionist">Nutritionist</SelectItem>
                    <SelectItem value="Student">Medical Student</SelectItem>
                    <SelectItem value="Consultant">Business Consultant</SelectItem>
                    <SelectItem value="Imam">Imam</SelectItem>
                    <SelectItem value="Designer">Graphic Designer</SelectItem>
                    <SelectItem value="Chef">Chef</SelectItem>
                    <SelectItem value="Social Worker">Social Worker</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedInterest} onValueChange={setSelectedInterest}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Interests</SelectItem>
                    <SelectItem value="Islamic Studies">Islamic Studies</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Art">Art & Design</SelectItem>
                    <SelectItem value="Cooking">Cooking</SelectItem>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {users?.length === 0
          ? (
              <div className="text-center py-16">
                <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No people found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters to find more people</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )
          : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {users?.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>

                {totalPages > 1 && <Pagination />}
              </>
            )}
      </div>
    </div>
  );
}
