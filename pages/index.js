<section className="relative min-h-screen bg-black overflow-hidden">

  {/* Background */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff3b1f25,transparent_45%)]"></div>

  <div className="absolute inset-0 opacity-[0.03]"
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
      backgroundSize: "80px 80px",
    }}
  />

  {/* Navbar */}

  <nav className="relative z-20 max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">

    <img
      src="/logo.png"
      alt="FlashTrack"
      className="h-14"
    />

    <a
      href="https://wa.me/917902411421"
      className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold"
    >
      Start Free
    </a>

  </nav>

  {/* Hero */}

  <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">

    <div className="grid lg:grid-cols-2 gap-20 items-center">

      {/* Left */}

      <div>

        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm mb-8">
          Trusted Order Tracking For Growing Businesses
        </div>

        <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-white">

          Turn Order

          <span className="block bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Tracking
          </span>

          Into Trust.

        </h1>

        <p className="mt-8 text-xl text-zinc-400 leading-relaxed max-w-xl">

          Give every customer a professional tracking experience.
          Reduce support messages, lower RTO losses and build
          confidence in your brand.

        </p>

        <div className="flex gap-4 mt-10">

          <a
            href="https://wa.me/917902411421"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold text-lg"
          >
            Start Free
          </a>

          <a
            href="#benefits"
            className="px-8 py-4 rounded-2xl border border-zinc-700 text-white"
          >
            Learn More
          </a>

        </div>

      </div>

      {/* Right */}

      <div className="relative">

        <div className="absolute inset-0 blur-3xl bg-red-500/20"></div>

        <div className="relative bg-zinc-950 border border-zinc-800 rounded-[32px] p-8">

          <div className="flex justify-between items-center mb-8">

            <h3 className="text-white font-bold text-xl">
              FlashTrack Dashboard
            </h3>

            <div className="h-3 w-3 rounded-full bg-green-500"></div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="text-zinc-500 text-sm">
                Active Orders
              </div>

              <div className="text-white text-5xl font-black mt-2">
                127
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="text-zinc-500 text-sm">
                Delivered
              </div>

              <div className="text-green-500 text-5xl font-black mt-2">
                91
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="text-zinc-500 text-sm">
                Support Saved
              </div>

              <div className="text-yellow-400 text-5xl font-black mt-2">
                73%
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="text-zinc-500 text-sm">
                RTO Alerts
              </div>

              <div className="text-red-500 text-5xl font-black mt-2">
                4
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</section>
