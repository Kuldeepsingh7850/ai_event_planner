import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CreateEvent() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ai');
  }, [router]);

  return (
    <div className="flex justify-center items-center py-32">
      <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
}
