import { Suspense } from "react";
import DeepResearchContent from "./DeepResearchContent";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 border-4 border-current border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function DeepResearchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DeepResearchContent />
    </Suspense>
  );
}
