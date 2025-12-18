'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GameRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/games');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to games...</p>
    </div>
  );
}
