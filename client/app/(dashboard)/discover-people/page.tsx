"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type User = {
  id: number;
  username: string;
  fullName: string;
  avatar: string | null;
  bio: string;
  location: string;
  joinedDate: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing: boolean;
  isVerified: boolean;
  interests: string[];
  mutualFriends: number;
  profession?: string;
  age?: number;
};

const mockUsers: User[] = [
  {
    id: 1,
    username: "ahmed_hassan",
    fullName: "Ahmed Hassan",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Islamic scholar and community leader. Spreading knowledge and peace through education and community service. 🕌",
    location: "Cairo, Egypt",
    joinedDate: "2023-01-15",
    followers: 2500,
    following: 180,
    posts: 145,
    isFollowing: false,
    isVerified: true,
    interests: ["Islamic Studies", "Community", "Education", "Teaching"],
    mutualFriends: 12,
    profession: "Islamic Scholar",
    age: 35,
  },
  {
    id: 2,
    username: "fatima_ali",
    fullName: "Fatima Ali",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Quran teacher and mother of 3. Dedicated to Islamic education and family values. Alhamdulillah for everything! 📚",
    location: "Istanbul, Turkey",
    joinedDate: "2023-03-20",
    followers: 1800,
    following: 220,
    posts: 89,
    isFollowing: true,
    isVerified: false,
    interests: ["Teaching", "Family", "Quran", "Education"],
    mutualFriends: 8,
    profession: "Teacher",
    age: 29,
  },
  {
    id: 3,
    username: "omar_malik",
    fullName: "Omar Malik",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Software engineer by day, Islamic content creator by night. Building technology solutions for the Muslim community. Tech for Ummah! 💻",
    location: "London, UK",
    joinedDate: "2022-11-10",
    followers: 3200,
    following: 150,
    posts: 234,
    isFollowing: false,
    isVerified: true,
    interests: ["Technology", "Islamic Content", "Programming", "Innovation"],
    mutualFriends: 15,
    profession: "Software Engineer",
    age: 28,
  },
  {
    id: 4,
    username: "aisha_rahman",
    fullName: "Aisha Rahman",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Certified nutritionist helping Muslims maintain halal healthy lifestyle. Wellness through Islamic principles. 🥗",
    location: "Dhaka, Bangladesh",
    joinedDate: "2023-05-08",
    followers: 1200,
    following: 300,
    posts: 67,
    isFollowing: false,
    isVerified: false,
    interests: ["Health", "Nutrition", "Lifestyle", "Wellness"],
    mutualFriends: 5,
    profession: "Nutritionist",
    age: 32,
  },
  {
    id: 5,
    username: "yusuf_ibrahim",
    fullName: "Yusuf Ibrahim",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Medical student and volunteer. Serving humanity is serving Allah. Dedicated to healthcare and community service. 🩺",
    location: "Riyadh, Saudi Arabia",
    joinedDate: "2023-02-14",
    followers: 950,
    following: 180,
    posts: 45,
    isFollowing: true,
    isVerified: false,
    interests: ["Medicine", "Volunteering", "Community Service", "Healthcare"],
    mutualFriends: 3,
    profession: "Medical Student",
    age: 24,
  },
  {
    id: 6,
    username: "khadija_omar",
    fullName: "Khadija Omar",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Entrepreneur and Islamic finance consultant. Promoting halal business practices and ethical entrepreneurship. 💼",
    location: "Dubai, UAE",
    joinedDate: "2022-09-25",
    followers: 4100,
    following: 120,
    posts: 178,
    isFollowing: false,
    isVerified: true,
    interests: ["Business", "Islamic Finance", "Entrepreneurship", "Consulting"],
    mutualFriends: 20,
    profession: "Business Consultant",
    age: 31,
  },
  {
    id: 7,
    username: "hassan_ali",
    fullName: "Hassan Ali",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Imam and community organizer. Building bridges between communities through interfaith dialogue and understanding.",
    location: "Toronto, Canada",
    joinedDate: "2023-04-12",
    followers: 1650,
    following: 95,
    posts: 112,
    isFollowing: false,
    isVerified: true,
    interests: ["Community", "Interfaith", "Leadership", "Spirituality"],
    mutualFriends: 7,
    profession: "Imam",
    age: 42,
  },
  {
    id: 8,
    username: "mariam_hassan",
    fullName: "Mariam Hassan",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Graphic designer specializing in Islamic art and calligraphy. Creating beautiful designs that reflect our faith.",
    location: "Casablanca, Morocco",
    joinedDate: "2023-06-18",
    followers: 890,
    following: 245,
    posts: 78,
    isFollowing: false,
    isVerified: false,
    interests: ["Art", "Design", "Calligraphy", "Creativity"],
    mutualFriends: 4,
    profession: "Graphic Designer",
    age: 26,
  },
  {
    id: 9,
    username: "ibrahim_malik",
    fullName: "Ibrahim Malik",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Chef and halal food advocate. Sharing delicious halal recipes and promoting Islamic dietary principles worldwide.",
    location: "Melbourne, Australia",
    joinedDate: "2022-12-03",
    followers: 2100,
    following: 180,
    posts: 156,
    isFollowing: true,
    isVerified: false,
    interests: ["Cooking", "Food", "Halal", "Culture"],
    mutualFriends: 9,
    profession: "Chef",
    age: 33,
  },
  {
    id: 10,
    username: "zainab_ahmed",
    fullName: "Zainab Ahmed",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Social worker and women's rights advocate. Empowering Muslim women through education and community support.",
    location: "Karachi, Pakistan",
    joinedDate: "2023-01-28",
    followers: 1450,
    following: 320,
    posts: 93,
    isFollowing: false,
    isVerified: false,
    interests: ["Social Work", "Women's Rights", "Education", "Advocacy"],
    mutualFriends: 6,
    profession: "Social Worker",
    age: 30,
  },
];

const USERS_PER_PAGE = 6;

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedInterest, setSelectedInterest] = useState("all");
  const [selectedProfession, setSelectedProfession] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch
            = user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
              || user.username.toLowerCase().includes(searchQuery.toLowerCase())
              || user.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation
            = selectedLocation === "all" || user.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesInterest
            = selectedInterest === "all"
              || user.interests.some(interest => interest.toLowerCase().includes(selectedInterest.toLowerCase()));

    const matchesProfession
            = selectedProfession === "all" || user.profession?.toLowerCase().includes(selectedProfession.toLowerCase());

    return matchesSearch && matchesLocation && matchesInterest && matchesProfession;
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLocation, selectedInterest, selectedProfession]);

  const handleFollow = async (userId: number) => {
    setIsLoading(true);

    setTimeout(() => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? {
                ...user,
                isFollowing: !user.isFollowing,
                followers: user.isFollowing ? user.followers - 1 : user.followers + 1,
              }
            : user,
        ),
      );

      setIsLoading(false);
    }, 800);
  };

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

  const UserCard = ({ user }: { user: User }) => (
    <Card className="group hover:shadow-xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 hover:scale-[1.02] cursor-pointer">
      <CardContent className="p-0">
        {/* Header with gradient background */}
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
        </div>

        <div className="px-6 pb-6 -mt-10 relative">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg">
                  {user.fullName
                    .split(" ")
                    .map(n => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 ring-2 ring-white dark:ring-gray-800">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user.fullName}</h3>
            </div>
            <p className="text-primary font-medium text-sm">
              @
              {user.username}
            </p>
            {user.profession && <p className="text-muted-foreground text-sm mt-1">{user.profession}</p>}
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>

          {/* Location and Age */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{user.location}</span>
            </div>
            {user.age && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {user.age}
                  {" "}
                  years old
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm mb-4">
            <div className="text-center">
              <div className="font-bold text-gray-900 dark:text-white">{user.followers.toLocaleString()}</div>
              <div className="text-muted-foreground text-xs">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 dark:text-white">{user.following}</div>
              <div className="text-muted-foreground text-xs">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 dark:text-white">{user.posts}</div>
              <div className="text-muted-foreground text-xs">Posts</div>
            </div>
          </div>

          {/* Interests */}
          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {user.interests.slice(0, 3).map((interest, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                {interest}
              </Badge>
            ))}
            {user.interests.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                +
                {user.interests.length - 3}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 bg-transparent"
              onClick={() => setSelectedUser(user)}
            >
              View Profile
            </Button>
            <Button
              onClick={() => handleFollow(user.id)}
              disabled={isLoading}
              size="sm"
              className={`flex-1 h-9 ${user.isFollowing
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                : "bg-primary hover:bg-primary/90"
              }`}
              variant={user.isFollowing ? "outline" : "default"}
            >
              {user.isFollowing
                ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Following
                    </>
                  )
                : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Follow
                    </>
                  )}
            </Button>
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
        {startIndex + 1}
        -
        {Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)}
        {" "}
        of
        {filteredUsers.length}
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

        {paginatedUsers.length === 0
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
                  {paginatedUsers.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>

                {totalPages > 1 && <Pagination />}
              </>
            )}

        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedUser && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">User Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                        <AvatarImage src={selectedUser.avatar || undefined} alt={selectedUser.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-xl">
                          {selectedUser.fullName
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUser.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-2">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl font-bold mb-1">{selectedUser.fullName}</h2>
                    <p className="text-primary font-medium mb-2">
                      @
                      {selectedUser.username}
                    </p>
                    {selectedUser.profession && <p className="text-muted-foreground">{selectedUser.profession}</p>}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedUser.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedUser.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Joined
                            {" "}
                            {new Date(selectedUser.joinedDate).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {selectedUser.age && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {selectedUser.age}
                              {" "}
                              years old
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Stats</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Followers:</span>
                          <span className="font-medium">{selectedUser.followers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Following:</span>
                          <span className="font-medium">{selectedUser.following}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Posts:</span>
                          <span className="font-medium">{selectedUser.posts}</span>
                        </div>
                        {selectedUser.mutualFriends > 0 && (
                          <div className="flex justify-between">
                            <span>Mutual Friends:</span>
                            <span className="font-medium">{selectedUser.mutualFriends}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleFollow(selectedUser.id)}
                      disabled={isLoading}
                      className="flex-1"
                      variant={selectedUser.isFollowing ? "outline" : "default"}
                    >
                      {selectedUser.isFollowing
                        ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Following
                            </>
                          )
                        : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow
                            </>
                          )}
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Message
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
