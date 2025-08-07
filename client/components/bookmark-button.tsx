import { useMutation } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { bookmarkPost } from "@/lib/apis/posts";
import { showError } from "@/lib/toast";
import { useStore } from "@/store/store";

function BookmarkButton({ post }: { post: PostsEntity }) {
  const [isBookmarked, setIsBookmarked] = useState(post?.isBookmarked || false);
  const { user, setUser } = useStore();

  const { mutate: bookmarkFunc } = useMutation({
    mutationFn: bookmarkPost,
    onError: (error) => {
      showError(error.message);
    },
  });

  function handleBookMark() {
    bookmarkFunc(post.id);
    setIsBookmarked(!isBookmarked);
    if (user)
      setUser({ ...user, totalBookmarks: isBookmarked ? user?.totalBookmarks - 1 : user?.totalBookmarks + 1 });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={isBookmarked ? "text-primary" : "text-muted-foreground"}
      onClick={handleBookMark}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary" : ""}`} />
    </Button>
  );
}

export default BookmarkButton;
