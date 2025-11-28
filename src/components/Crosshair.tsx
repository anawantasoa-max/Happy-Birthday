interface CrosshairProps {
  visible?: boolean;
}

export const Crosshair = ({ visible = false }: CrosshairProps) => {
  if (!visible) return null;
  
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-fade-in">
      {/* Small bright dot with glow for bouquet interaction */}
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full opacity-30 blur-sm" />
        {/* Inner dot */}
        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-100 shadow-lg border border-pink-300" />
      </div>
    </div>
  );
};

