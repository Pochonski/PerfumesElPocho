import {
  ClerkProvider,
  SignInButton,
  Show,
  UserButton,
} from "@clerk/nextjs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-[#080808] text-zinc-100">
        {/* Admin Navbar */}
        <header className="glass-surface sticky top-0 z-50">
          <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
            <span className="text-lg font-bold tracking-tighter gold-gradient">
              Admin — Perfumes El Pocho
            </span>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="rounded-full border border-[#c8a84e]/30 bg-[#c8a84e]/10 px-4 py-1.5 text-sm font-medium text-[#c8a84e] transition-all hover:bg-[#c8a84e]/20">
                  Iniciar Sesión Admin
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton
                appearance={{ elements: { avatarBox: "h-8 w-8" } }}
              />
            </Show>
          </nav>
        </header>
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </ClerkProvider>
  );
}
