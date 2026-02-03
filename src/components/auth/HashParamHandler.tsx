"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Client component to extract error params from URL hash (#)
 * Supabase sends error_code in hash fragment which server can't read
 * This merges hash params into query params for consistent handling
 */
export function HashParamHandler() {
  const router = useRouter();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    // Only run once
    if (processed) return;

    // Check if there's a hash with error params
    const hash = window.location.hash;
    if (!hash || !hash.includes("error")) {
      setProcessed(true);
      return;
    }

    // Parse hash params (remove # first)
    const hashParams = new URLSearchParams(hash.substring(1));
    const errorCode = hashParams.get("error_code");
    const errorFromHash = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    // If we have error params in hash, merge them into query string
    if (errorCode || errorFromHash) {
      const currentUrl = new URL(window.location.href);
      const searchParams = currentUrl.searchParams;

      // Preserve existing query params and add hash params
      if (errorCode) searchParams.set("error_code", errorCode);
      if (errorFromHash && !searchParams.has("error")) {
        searchParams.set("error", errorFromHash);
      }
      if (errorDescription) {
        searchParams.set("error_description", errorDescription);
      }

      // Remove hash and navigate with merged params
      const newUrl = `${currentUrl.pathname}?${searchParams.toString()}`;

      // Replace current URL without hash, preserving all params
      router.replace(newUrl);
    }

    setProcessed(true);
  }, [processed, router]);

  return null; // This component doesn't render anything
}
