"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: "how_to_vote",
    color: "bg-blue-400",
    title: "Collaborative Voting",
    desc: "Decide where to go, what to eat, and when to meet with zero friction.",
  },
  {
    icon: "assignment_ind",
    color: "bg-green-400",
    title: "Task Delegation",
    desc: "Assign who's bringing the snacks and who's driving everyone home.",
  },
  {
    icon: "payments",
    color: "bg-purple-400",
    title: "Budget Tracking",
    desc: "Split bills without the awkward conversations. Everyone sees who paid what.",
  },
  {
    icon: "photo_library",
    color: "bg-yellow-400",
    title: "Shared Memories",
    desc: "A private space to store Google Drive links and relive the best moments.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8f6f5]">
      {/* Google Material Symbols font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      {/* Header */}
      <Navbar showCreateButton={false} variant="landing" />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 md:px-20 py-20 md:py-32 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col gap-8">
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
              Plan Better{" "}
              <span className="text-[#ff5833] italic">Hangouts</span> with
              GalaUs
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 max-w-xl leading-relaxed">
              Stop the group chat chaos. GalaUs helps groups plan outings, track
              budgets, and share memories all in one beautiful space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/create-gala"
                className="h-16 px-10 bg-[#ff5833] text-white text-xl font-black rounded-xl bold-border shadow-playful btn-push flex items-center justify-center"
              >
                Create a Gala
              </Link>
              <Link
                href="/join"
                className="h-16 px-10 bg-white text-xl font-black rounded-xl bold-border shadow-playful-primary btn-push flex items-center justify-center"
              >
                Join with Invite Link
              </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-lg">
            <div className="w-full aspect-square rounded-xl bold-border shadow-playful overflow-hidden bg-white">
              <img
                src="/catfriends.jpg"
                alt="Friends hanging out together"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-yellow-400 p-4 bold-border shadow-playful-sm rounded-lg rotate-[-5deg] hidden md:block">
              <span className="text-black font-black text-base">
                No more "IDK, you pick"
              </span>
            </div>
            <div className="absolute -top-6 -right-6 bg-[#ff5833] p-4 bold-border shadow-playful-sm rounded-lg rotate-[5deg] hidden md:block">
              <span className="text-white font-black text-base">
                Budgeting: Solved!
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-6 md:px-20 py-24">
          <div className="flex flex-col items-center text-center gap-4 mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">
              Plan smarter,{" "}
              <span className="text-[#ff5833] underline decoration-[#ff5833]/30 underline-offset-8">
                party harder
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl">
              Ditch the messy group chats for a streamlined planning experience
              designed for real friends.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="group flex flex-col bg-white rounded-xl bold-border p-8 shadow-playful hover:-translate-y-2 transition-all duration-200"
              >
                <div
                  className={`size-16 rounded-full ${f.color} flex items-center justify-center bold-border mb-6 group-hover:rotate-12 transition-transform duration-200`}
                >
                  <span className="material-symbols-outlined text-white text-3xl font-bold">
                    {f.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-3">{f.title}</h3>
                <p className="text-slate-600 font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-[#ff5833]/5 py-24 border-y-4 border-[#23130f]/10">
          <div className="max-w-7xl mx-auto px-6 md:px-20">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: "add_circle",
                  title: "Create a Gala",
                  desc: "Give your outing a name, describe the vibe, and set the decision mode.",
                },
                {
                  step: "02",
                  icon: "group_add",
                  title: "Invite Your Crew",
                  desc: "Share the invite link and get everyone on the same page instantly.",
                },
                {
                  step: "03",
                  icon: "rocket_launch",
                  title: "Plan & Go!",
                  desc: "Vote on options, delegate tasks, track expenses, and make memories.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-xl bold-border p-8 shadow-playful flex flex-col gap-4"
                >
                  <div className="text-6xl font-black text-[#ff5833]/20">
                    {item.step}
                  </div>
                  <div className="size-14 rounded-full bg-[#ff5833] flex items-center justify-center bold-border">
                    <span className="material-symbols-outlined text-white text-2xl font-bold">
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black">{item.title}</h3>
                  <p className="text-slate-600 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 md:px-20 py-24">
          <div className="bg-white rounded-xl bold-border p-8 md:p-16 shadow-playful-primary flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
            <div className="flex-1 flex flex-col gap-6">
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Ready to start your next adventure?
              </h2>
              <p className="text-xl text-slate-600 font-medium">
                No credit card required. Just create a gala and invite your
                friends.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  href="/create-gala"
                  className="h-16 px-10 bg-[#ff5833] text-white text-xl font-black rounded-xl bold-border shadow-playful btn-push flex items-center justify-center"
                >
                  Create a Gala Now
                </Link>
                <Link
                  href="/join"
                  className="h-16 px-10 bg-white text-xl font-black rounded-xl bold-border shadow-playful-sm btn-push flex items-center justify-center"
                >
                  Join with Code
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <div className="size-64 md:size-72 bg-yellow-300 rounded-full bold-border flex items-center justify-center relative">
                <span className="material-symbols-outlined text-slate-900 text-[100px] font-black">
                  rocket_launch
                </span>
                <div className="absolute top-2 right-2 size-16 bg-blue-400 rounded-xl bold-border flex items-center justify-center rotate-12">
                  <span className="material-symbols-outlined text-white text-3xl">
                    celebration
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
