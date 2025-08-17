
import React from 'react';

export const CameraIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 14c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

export const CaptureIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
    </svg>
);

export const RetryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-1 13v-2.27c-2.47-.4-4.28-2.57-4.28-5.08 0-2.84 2.31-5.15 5.15-5.15 1.13 0 2.18.37 3.03.99l-1.42 1.42C12.98 9.2 12.5 9 12 9c-1.65 0-3 1.35-3 3s1.35 3 3 3c.75 0 1.42-.29 1.93-.76l1.42 1.42C14.43 16.48 13.28 17 12 17zM17 13.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z" />
    <path d="M17.5 10.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z" /><path d="M17.5 10.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z" />
  </svg>
);

export const DescribeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/>
    </svg>
);
