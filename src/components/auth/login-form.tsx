"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import Link from "next/link";
import { useAuth } from "~/hooks/useAuth";

export default function LoginForm() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await auth.login(email);
      setStep("code");
    } catch {
      // Error handled by hook's toast
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await auth.verifyLogin({ email, code });
      // Navigation handled by hook
    } catch {
      // Error handled by hook's toast
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="p-8">
      {step === "email" ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@restaurant.com"
              required
              disabled={isSending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSending}>
            Send Login Code
          </Button>
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-rose-600">
              Register
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <Label>Enter 6-digit code sent to {email}</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              required
              disabled={isVerifying}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isVerifying}>
            Verify & Login
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep("email")}
            className="w-full"
            disabled={isVerifying}
          >
            Back
          </Button>
        </form>
      )}
    </Card>
  );
}
