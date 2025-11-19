import RegisterForm from "~/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-3 text-gray-600">
            Start managing your digital menu today
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
