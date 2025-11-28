import { useState, useEffect } from "react";

interface WishModalProps {
  onWishSubmit: (wish: string) => void;
}

export const WishModal = ({ onWishSubmit }: WishModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [wish, setWish] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setWish("");
      // Notify that modal is opened
      const event = new Event('wishModalOpened');
      window.dispatchEvent(event);
    };

    window.addEventListener('openWishModal', handleOpen);
    return () => window.removeEventListener('openWishModal', handleOpen);
  }, []);

  // Notify when modal closes
  useEffect(() => {
    if (!isOpen) {
      const event = new Event('wishModalClosed');
      window.dispatchEvent(event);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (wish.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onWishSubmit(wish);
        setIsOpen(false);
        setIsSubmitting(false);
      }, 500);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      style={{ cursor: 'auto' }}
      onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100 rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all duration-300 scale-100 hover:scale-[1.02]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎂</div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            تمنى أمنية
          </h2>
          <p className="text-gray-600">
            اكتب أمنيتك وانفخ الشموع ✨
          </p>
        </div>

        {/* Wish Input */}
        <div className="mb-6">
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="أتمنى أن..."
            className="w-full h-32 p-4 border-2 border-pink-300 rounded-2xl focus:outline-none focus:border-purple-500 resize-none text-lg bg-white/80 backdrop-blur-sm"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={!wish.trim() || isSubmitting}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">💫</span>
                <span>جاري النفخ...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🌬️</span>
                <span>انفخ الشموع</span>
              </span>
            )}
          </button>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-4 border-2 border-pink-300 hover:border-pink-500 text-pink-600 font-bold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-6 flex justify-center gap-2 text-2xl opacity-70">
          <span className="animate-pulse">✨</span>
          <span className="animate-pulse delay-100">💖</span>
          <span className="animate-pulse delay-200">🎈</span>
          <span className="animate-pulse delay-300">🎉</span>
        </div>
      </div>
    </div>
  );
};

