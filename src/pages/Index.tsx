import { lazy, Suspense } from "react";

// Lazy load Room3D for faster initial page load
const Room3D = lazy(() => import("@/components/Room3D").then(module => ({ default: module.Room3D })));

const Index = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-black">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto">
              <svg className="animate-spin" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset="141"
                  className="text-pink-500"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            <p className="text-white text-lg">جاري التحميل...</p>
          </div>
        </div>
      }>
        <Room3D />
      </Suspense>
    </div>
  );
};

export default Index;
