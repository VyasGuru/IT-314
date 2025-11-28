import { useEffect } from "react";

/**
 * Component that prevents browser back button navigation
 * Disables back navigation, users can only use app buttons
 */
export default function PreventBackNavigation() {
  useEffect(() => {
    // Prevent back button navigation
    const handlePopState = (event) => {
      event.preventDefault();
      window.history.forward();
    };

    // Add popstate listener
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null; // This component doesn't render anything
}
