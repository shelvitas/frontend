const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="flex min-h-screen items-center justify-center p-4">
    <div className="w-full max-w-md space-y-6">{children}</div>
  </main>
);

export default AuthLayout;
