"use client";

import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import "../../chartSetup";
import axios from "axios";

interface DataPoint {
  time: string;
  price: number;
}

export default function GoldChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxDataPoints = 20; // Keep last 20 data points

  const fetchGoldPrice = async () => {
    try {
      const res = await axios.get("/api/gold");
      console.log("Full API Response:", res.data);
      console.log("Price:", res.data.price);

      // Twelve Data returns the price directly in the 'price' field
      const price = parseFloat(res.data.price);

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
      console.error("Error fetching gold data:", err);
      setError("Failed to fetch gold price data");
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGoldPrice();

    // Set up interval for updates every 5 seconds
    intervalRef.current = setInterval(fetchGoldPrice, 5000);

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
            label: "Gold Price (USD/oz)",
            data: dataPoints.map((point) => point.price),
            borderColor: "rgba(255, 206, 84, 1)",
            backgroundColor: "rgba(255, 206, 84, 0.2)",
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
  if (!chartData || dataPoints.length === 0) return <p>Loading chart...</p>;

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
        text: `Gold Price - Live Updates (${dataPoints.length} data points)`,
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
        title: { display: true, text: "Price (USD/oz)" },
        beginAtZero: false,
      },
    },
  };

  return (
    <div>
      <Line data={chartData} options={options} />
    </div>
  );
}
