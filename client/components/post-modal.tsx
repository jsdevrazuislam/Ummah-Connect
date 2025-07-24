"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreatePostForm } from "@/components/create-post-form";
import { useStore } from "@/store/store";

export function GlobalModal() {
  const { isOpen, setIsOpen } = useStore();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl max-h-[450px] p-0 overflow-scroll">
        <DialogTitle className="sr-only">
          Post Form
        </DialogTitle>
        <div>
          <CreatePostForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}