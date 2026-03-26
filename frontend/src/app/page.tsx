"use client";

import { useSearchParams } from 'next/navigation';
import { SignupFlowContainer } from "../features/signup/components/SignupFlowContainer";
import { Suspense } from 'react';

function ProtectedSignupFlow() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || undefined;

  return (
    <SignupFlowContainer 
      initialSource={{ referralCode }} 
    />
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ProtectedSignupFlow />
    </Suspense>
  );
}

