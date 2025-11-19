"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { removeAuthCookie, setAuthCookie } from "~/server/actions/auth";

export function useAuth() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => toast.success("Code sent!"),
    onError: (err) => toast.error(err.message),
  });

  const verifyRegisterMutation = api.auth.verifyAndCreate.useMutation({
    onSuccess: async (data) => {
      await setAuthCookie(data.token);
      setIsLoggedIn(true);
      toast.success("Registered successfully!");
      router.push("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  const loginMutation = api.auth.login.useMutation({
    onSuccess: () => toast.success("Code sent!"),
    onError: (err) => toast.error(err.message),
  });

  const verifyLoginMutation = api.auth.verifyLogin.useMutation({
    onSuccess: async (data) => {
      await setAuthCookie(data.token);
      setIsLoggedIn(true);
      toast.success("Logged in!");
      router.push("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  const getSession = api.auth.getSession.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return {
    session: getSession.data,
    isLoggedIn: isLoggedIn || !!getSession.data,

    register: async (data: {
      email: string;
      name: string;
      country: string;
    }) => {
      await registerMutation.mutateAsync(data);
    },

    verifyRegister: (data: {
      email: string;
      code: string;
      name: string;
      country: string;
    }) => verifyRegisterMutation.mutateAsync(data),

    login: async (email: string) => loginMutation.mutateAsync({ email }),

    verifyLogin: (data: { email: string; code: string }) =>
      verifyLoginMutation.mutateAsync(data),

    logout: () => removeAuthCookie(),
  };
}
