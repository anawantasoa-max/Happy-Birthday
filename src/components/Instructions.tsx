interface InstructionsProps {
  isLocked: boolean;
}

export const Instructions = ({ isLocked }: InstructionsProps) => {
  if (isLocked) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
      <div className="bg-card/95 backdrop-blur-sm border-2 border-primary rounded-2xl p-8 shadow-2xl max-w-md mx-4 pointer-events-auto animate-fade-in">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">💖</div>
          <h1 className="text-3xl font-bold text-primary mb-4">
            مرحباً بك في عالمنا
          </h1>
          <div className="space-y-4 text-foreground">
            <p className="text-lg">
              اضغط في أي مكان للدخول
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-primary">التحكم:</p>
              <p>⌨️ <span className="font-mono bg-background px-2 py-1 rounded">W A S D</span> أو <span className="font-mono bg-background px-2 py-1 rounded">ص ش س ي</span> أو <span className="font-mono bg-background px-2 py-1 rounded">الأسهم</span></p>
              <p>🖱️ الماوس للنظر حولك</p>
              <p className="text-xs text-muted-foreground mt-2">يعمل مع الكيبورد العربي والإنجليزي 🌐</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              استكشف الغرفة واستمتع بالهدايا والذكريات 💝
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
