const GalaLiveLogo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="24" cy="24" r="22" fill="none" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.3" />
        
        <path
          d="M24 8 L32 20 L40 20 L34 28 L36 36 L24 30 L12 36 L14 28 L8 20 L16 20 Z"
          fill="url(#logoGradient)"
          filter="url(#logoGlow)"
        />
        
        <circle cx="24" cy="24" r="6" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
};

export default GalaLiveLogo;
