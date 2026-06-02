import { Header } from "./Header";
import { Footer } from "@/components/organisms/Footer";
import { LoginForm } from "@/components/organisms/LoginForm";

const Login = () => {
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-28">
        <section className="bg-surface-section min-h-[calc(100vh-112px)] flex items-center justify-center px-8 py-16 relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #0050cb 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-lg">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Researcher Access Session
              </span>
            </div>

            <LoginForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
