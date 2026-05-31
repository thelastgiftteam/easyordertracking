export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVBAR */}

      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="FlashTrack"
            className="h-10"
          />
        </div>

        <a
          href="https://wa.me/917902411421"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold"
        >
          Start Free
        </a>

      </nav>

      {/* HERO */}

      <section className="max-w-6xl mx-auto px-6 py-24">

        <div className="max-w-4xl">

          <div className="inline-flex mb-8 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            Setup in 24 Hours
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight">

            Track Every Order.

            <span className="block bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
              Build Trust.
            </span>

          </h1>

          <p className="mt-8 text-xl text-zinc-400 max-w-2xl leading-relaxed">
            FlashTrack gives your customers a professional
            order tracking experience while reducing support
            messages and RTO losses.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">

            <a
              href="https://wa.me/917902411421"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold hover:scale-105 transition"
            >
              Start Free
            </a>

            <a
              href="#pricing"
              className="px-8 py-4 rounded-xl border border-zinc-700"
            >
              Pricing
            </a>

          </div>

        </div>

      </section>

      {/* BENEFITS */}

      <section className="max-w-6xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-3 gap-6">

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h3 className="text-2xl font-bold">
              Less Support
            </h3>

            <p className="mt-4 text-zinc-400">
              Customers track their own orders.
              No more daily "Where is my order?"
              messages.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h3 className="text-2xl font-bold">
              Fewer RTOs
            </h3>

            <p className="mt-4 text-zinc-400">
              Customers stay informed and ready
              to receive deliveries.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h3 className="text-2xl font-bold">
              More Trust
            </h3>

            <p className="mt-4 text-zinc-400">
              Give buyers a professional branded
              tracking experience.
            </p>
          </div>

        </div>

      </section>

      {/* STORY */}

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">

        <p className="text-zinc-400 text-lg leading-relaxed">

          FlashTrack was born from our own business.

          We ran a custom frame company and spent hours
          every week answering order tracking questions.

          So we built a simple tracking portal.

          Customers loved it.

          Support messages dropped.

          Trust increased.

          FlashTrack is now available for every small business.

        </p>

      </section>

      {/* PRICING */}

      <section
        id="pricing"
        className="max-w-3xl mx-auto px-6 py-20"
      >

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-12 text-center">

          <div className="text-yellow-400 font-bold">
            FIRST MONTH FREE
          </div>

          <h2 className="mt-6 text-6xl font-black">
            ₹750
          </h2>

          <p className="text-zinc-400 mt-2">
            per month
          </p>

          <div className="mt-10 space-y-4 text-zinc-300">

            <div>Unlimited Order Tracking</div>
            <div>Branded Tracking Page</div>
            <div>WhatsApp Support</div>
            <div>24 Hour Setup</div>

          </div>

          <a
            href="https://wa.me/917902411421"
            className="inline-block mt-10 px-10 py-4 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold"
          >
            Start Free
          </a>

        </div>

      </section>

      {/* FINAL CTA */}

      <section className="px-6 py-24 text-center">

        <h2 className="text-5xl font-black">
          Give Customers
          <span className="block text-yellow-400">
            A Better Experience
          </span>
        </h2>

        <a
          href="https://wa.me/917902411421"
          className="inline-block mt-10 px-10 py-4 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold"
        >
          Start Free Today
        </a>

      </section>

    </main>
  );
}
