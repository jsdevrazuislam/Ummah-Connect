import React from "react";

import { SocialMediaLayout } from "@/components/layouts/main-layout";

function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocialMediaLayout>
      {children}
    </SocialMediaLayout>
  );
}

export default SidebarLayout;
