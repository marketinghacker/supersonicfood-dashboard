import LoginForm from './components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            SUPERSONIC<span className="text-green-400">FOOD</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Creative Performance Dashboard</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <p className="text-xs text-gray-600">
          Powered by <span className="text-gray-400 font-medium">Marketing Hackers</span>
        </p>
      </div>
    </main>
  );
}
