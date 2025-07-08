"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreatePostForm } from "@/components/create-post-form";
import { AIContentGenerator } from "@/components/ai-content-generator";
import { useState } from "react";
import { useAuthStore } from "@/store/store";

export function GlobalModal() {
  const { isOpen, setIsOpen } = useAuthStore();
  const [showContentGenerator, setShowContentGenerator] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl max-h-[350px] p-0 overflow-scroll">
        <DialogTitle className="sr-only">
          Post Form
        </DialogTitle>
        <div>
          <CreatePostForm 
            onAIHelp={() => setShowContentGenerator(!showContentGenerator)} 
          />
          {showContentGenerator && (
            <div className="mt-4">
              <AIContentGenerator />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}