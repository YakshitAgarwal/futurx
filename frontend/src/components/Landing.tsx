import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Play,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(1950);
  const [isIncreasing, setIsIncreasing] = useState(true);

  // Simulate price changes for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 20;
        const newPrice = prev + change;
        setIsIncreasing(change > 0);
        return Math.max(1900, Math.min(2000, newPrice));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Real World Assets",
      description:
        "Trade Gold, Oil, and other commodities directly on-chain without intermediaries",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Oracle-Secured",
      description:
        "Chainlink price feeds ensure fair and tamper-proof settlement for all trades",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Settlement",
      description:
        "Smart contracts automate trade execution and settlement in USDC stablecoins",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Long & Short",
      description:
        "Profit from both rising and falling markets with flexible position taking",
    },
  ];

  const stats = [
    { value: "$2.4B+", label: "Total Value Locked" },
    { value: "50K+", label: "Active Traders" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Global Access" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FuturX</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#assets"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Assets
            </a>
            <Link
              href="../trading"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Launch App
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 md:hidden">
            <div className="px-6 py-4 space-y-4">
              <a
                href="#features"
                className="block text-slate-300 hover:text-white"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-slate-300 hover:text-white"
              >
                How It Works
              </a>
              <a
                href="#assets"
                className="block text-slate-300 hover:text-white"
              >
                Assets
              </a>
              <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-lg">
                Launch App
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">
                  Now Live on Citrea Testnet
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Trade Real World
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {" "}
                  Assets
                </span>
                <br />
                Onchain
              </h1>

              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Access commodity and crypto asset through decentralized futures
                contracts. Go long or short with USDC collateral and
                oracle-based settlement.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="../trading"
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-semibold"
                >
                  <span>Start Trading</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="border border-slate-600 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all duration-200 flex items-center justify-center space-x-2 text-lg">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trading Interface Preview */}
            <div className="relative">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Live Trading
                  </h3>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">AU</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Gold/USD</div>
                        <div className="text-slate-400 text-sm">XAU/USD</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          isIncreasing ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        ${currentPrice.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm ${
                          isIncreasing ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isIncreasing ? "+" : "-"}0.
                        {Math.floor(Math.random() * 50) + 10}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
                      Long
                    </button>
                    <button className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
                      Short
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Collateral</span>
                      <span className="text-white">USDC</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-400">Settlement</span>
                      <span className="text-white">Oracle-based</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-semibold shadow-xl animate-bounce">
                Live Prices
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Built for the Future of
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {" "}
                Trading
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Combining traditional asset exposure with cutting-edge DeFi
              infrastructure for seamless, trustless trading experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Simple. Fast.
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {" "}
                Decentralized.
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Three steps to start trading real-world assets on-chain
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Position",
                description:
                  "Choose your asset (Gold/BTC) and position direction (Long/Short). Lock USDC collateral.",
              },
              {
                step: "02",
                title: "Match & Trade",
                description:
                  "Smart contracts match you with counterparties. Your position goes live immediately on-chain.",
              },
              {
                step: "03",
                title: "Auto Settlement",
                description:
                  "At expiry, Chainlink oracles determine the winner. Profits paid automatically in USDC.",
              },
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all duration-300">
                  <div className="text-6xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-amber-400/10 to-orange-500/10 border-y border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders accessing real-world assets through
            decentralized futures contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="../trading"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-10 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg font-semibold"
            >
              Launch Platform
            </Link>
            <button className="border border-slate-600 text-white px-10 py-4 rounded-xl hover:bg-slate-800 transition-all duration-200 text-lg">
              Read Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">FuturX</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p>© 2025 FuturX. Built for DeFi innovation.</p>
              <p className="text-sm mt-1">Secured by Smart Contracts</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
