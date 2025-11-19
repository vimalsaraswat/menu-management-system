"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import Link from "next/link";
import { useAuth } from "~/hooks/useAuth";

export default function RegisterForm() {
  const auth = useAuth();

  const [step, setStep] = useState<"form" | "code">("form");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
  });

  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await auth.register(formData);
      setStep("code");
    } catch {
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await auth.verifyRegister({ ...formData, code });
    } catch {
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="p-8">
      {step === "form" ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="John Doe"
              required
              disabled={isSending}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="owner@restaurant.com"
              required
              disabled={isSending}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) =>
                setFormData({ ...formData, country: value })
              }
              disabled={isSending}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UAE">UAE</SelectItem>
                {/* Add more countries as needed */}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? "Sending…" : "Send Verification Code"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-rose-600">
              Login
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <Label>Enter 6-digit code sent to {formData.email}</Label>
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
            {isVerifying ? "Verifying…" : "Complete Registration"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setStep("form");
              setCode("");
            }}
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
