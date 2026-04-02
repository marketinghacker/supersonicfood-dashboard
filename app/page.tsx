import LoginForm from './components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="https://supersonicfood.com/cdn/shop/files/desktop_-_flow.png?format=webp&v=1769515948&width=2560"
            alt="SupersonicFood"
            className="h-12 w-auto"
          />
          <p className="text-sm text-gray-400">Creative Performance Dashboard</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-gray-600">Powered by</span>
          <img src="/mh-logo.png" alt="Marketing Hackers" className="h-4 w-auto opacity-50" />
        </div>
      </div>
    </main>
  );
}
