import LoginForm from "~/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-3 text-gray-600">Manage your restaurant menu</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
