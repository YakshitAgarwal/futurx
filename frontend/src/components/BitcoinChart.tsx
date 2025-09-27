"use client";

import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import "../../chartSetup";
import axios from "axios";

interface DataPoint {
  time: string;
  price: number;
}

export default function BitcoinChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxDataPoints = 20; // Keep last 20 data points

  const fetchBitcoinPrice = async () => {
    try {
      const res = await axios.get("/api/btc");
      console.log("Full API Response:", res.data);

      const price = res.data.bitcoin?.usd ?? 0;

      console.log("Bitcoin Price:", price);

      const now = new Date();
      const timeString = now.toLocaleTimeString();

      const newDataPoint: DataPoint = {
        time: timeString,
        price: price,
      };

      setDataPoints((prevPoints) => {
        const updatedPoints = [...prevPoints, newDataPoint];
        return updatedPoints.slice(-maxDataPoints);
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching bitcoin data:", err);
      setError("Failed to fetch Bitcoin price data");
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchBitcoinPrice();

    // Set up interval for updates every 5 seconds
    intervalRef.current = setInterval(fetchBitcoinPrice, 5000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (dataPoints.length > 0) {
      setChartData({
        labels: dataPoints.map((point) => point.time),
        datasets: [
          {
            label: "Bitcoin Price (USD)",
            data: dataPoints.map((point) => point.price),
            borderColor: "rgba(247, 147, 26, 1)",
            backgroundColor: "rgba(247, 147, 26, 0.1)",
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      });
    }
  }, [dataPoints]);

  if (error) return <p>Error: {error}</p>;
  if (!chartData || dataPoints.length === 0)
    return <p>Loading Bitcoin chart...</p>;

  const currentPrice = dataPoints[dataPoints.length - 1]?.price || 0;
  const previousPrice =
    dataPoints.length > 1
      ? dataPoints[dataPoints.length - 2]?.price || 0
      : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent =
    previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

  const options = {
    responsive: true,
    animation: {
      duration: 750,
    },
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      title: {
        display: false,
        text: `Bitcoin (BTC) Price - Live Updates (${dataPoints.length} data points)`,
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Time" },
        ticks: {
          maxTicksLimit: 8,
        },
      },
      y: {
        title: { display: true, text: "Price (USD)" },
        beginAtZero: false,
        ticks: {
          callback: function (value: any) {
            return "$" + Number(value).toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div>
      <Line data={chartData} options={options} />
    </div>
  );
}
