import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export const LoadingScreen = () => {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-romantic-light via-romantic-rose/20 to-romantic-pink/30 flex items-center justify-center z-50 transition-opacity duration-500"
         style={{ opacity: progress === 100 ? 0 : 1 }}>
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 mx-auto">
            <svg className="animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                className="text-primary"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">💝</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-primary">جاري التحميل...</h2>
          <p className="text-lg text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
};
