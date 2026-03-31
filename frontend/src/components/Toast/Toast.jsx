import React, { useEffect, useState } from 'react';

export default function Toast({ message, onClose, isVisible, type = 'success' }) {
  const [shouldRender, setRender] = useState(isVisible);

  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-100' : 'bg-green-100';
  const borderColor = isError ? 'border-red-500' : 'border-green-500';
  const textColor = isError ? 'text-red-700' : 'text-green-700';
  const hoverColor = isError ? 'hover:text-red-900' : 'hover:text-green-900';

  useEffect(() => {
    if (isVisible) setRender(true);
  }, [isVisible]);

  const onAnimationEnd = () => {
    if (!isVisible) setRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div 
      onAnimationEnd={onAnimationEnd}
      className={`fixed top-24 left-1/2 z-50 
                  ${isVisible ? 'animate-toast-in' : 'animate-toast-out'}
                  ${bgColor} border-l-4 ${borderColor} ${textColor} 
                  p-4 rounded-xl shadow-2xl flex items-center min-w-[350px]
                  backdrop-blur-md bg-opacity-90`}
    >
      <div className="mr-3">
        {isError ? (
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
           </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="font-semibold">{message}</div>
      <button onClick={onClose} className={`ml-auto focus:outline-none ${hoverColor} transition-colors`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
