import { Header } from "./Header";
import { Footer } from "@/components/organisms/Footer";

const Dashboard = () => {
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-28">
        <section className="bg-surface-section min-h-[calc(100vh-112px)] px-8 py-16 relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #0050cb 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                Researcher Dashboard
              </span>
            </div>

            <h1 className="text-4xl font-black font-headline tracking-tight text-on-surface text-center mb-6">
              Welcome, Researcher
            </h1>
            <p className="text-lg text-on-surface-variant text-center max-w-xl mx-auto mb-12">
              You have successfully accessed the Biopatternsg research platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/15 shadow-xl">
                <h3 className="font-bold font-headline text-on-surface mb-2">
                  Active Analyses
                </h3>
                <p className="text-3xl font-black text-primary">0</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/15 shadow-xl">
                <h3 className="font-bold font-headline text-on-surface mb-2">
                  Completed Sequences
                </h3>
                <p className="text-3xl font-black text-primary">0</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/15 shadow-xl">
                <h3 className="font-bold font-headline text-on-surface mb-2">
                  Datasets Available
                </h3>
                <p className="text-3xl font-black text-primary">12</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
