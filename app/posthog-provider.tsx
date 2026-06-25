"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import React from "react";

if (typeof window !== "undefined") {
  const key = "phc_mZ8uHWbdAi4Xb96cwAeJG2HAxv9s6fKzbVf6THbpAmL7";
  const host = "https://us.i.posthog.com";
  
  if (key) {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // Pageviews handled manually
    });
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
