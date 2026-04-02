import LoginForm from './components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <img src="/supersonic-logo.png" alt="SUPERSONIC" className="h-10 w-auto invert" />
          <p className="text-base font-semibold text-gray-200">Creative Performance Dashboard</p>
        </div>

        <LoginForm />

        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-gray-400 font-medium">Powered by</span>
          <img src="/mh-logo.png" alt="Marketing Hackers" className="h-10 w-auto" />
        </div>
      </div>
    </main>
  );
}
