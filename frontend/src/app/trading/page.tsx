"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
import Wallet from "@/components/Wallet";
import MarketSidebar from "@/components/MarketSidebar";
import PriceChart from "@/components/PriceChart";
import CreatePosition from "@/components/CreatePosition";
import ActivePositions from "@/components/ActivePositions";

const Trading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6">
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FuturX</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
              My Portfolio
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
              Orders
            </button>
            <Wallet />
          </div>
        </div>
      </nav>
      <main className="py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          <MarketSidebar />
          <div className="lg:col-span-3 space-y-6">
            <PriceChart />
            <div className="grid md:grid-cols-2 gap-6">
              <CreatePosition />
              <ActivePositions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trading;
