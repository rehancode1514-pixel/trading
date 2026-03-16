import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

const Chart = ({ pair }) => {
  const chartContainerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart;
    let isMounted = true;

    const initChart = async () => {
      try {
        chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 500,
          layout: {
            backgroundColor: '#181a20',
            textColor: '#d1d4dc',
          },
          grid: {
            vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
          },
          rightPriceScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
          timeScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
        });

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#00ff88',
          downColor: '#ff3366',
          borderVisible: false,
          wickUpColor: '#00ff88',
          wickDownColor: '#ff3366',
        });

        const response = await axios.get(`${API_URL}/market/klines`, {
          params: { symbol: pair, timeframe: '1h', limit: 500 }
        });

        if (!isMounted) return;

        const data = response.data
          .filter(d => d.time && !isNaN(d.open))
          .map(d => ({
            time: Number(d.time),
            open: Number(d.open),
            high: Number(d.high),
            low: Number(d.low),
            close: Number(d.close),
          }))
          .sort((a, b) => a.time - b.time);

        // Deduplicate
        const uniqueData = data.filter((v, i, a) => i === 0 || v.time > a[i - 1].time);

        if (uniqueData.length > 0) {
          candlestickSeries.setData(uniqueData);
          chart.timeScale().fitContent();
        }

        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
          }
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (err) {
        console.error('Chart error:', err);
        if (isMounted) setError(err.message);
      }
    };

    initChart();

    return () => {
      isMounted = false;
      if (chart) {
        chart.remove();
        chart = null;
      }
    };
  }, [pair]);

  if (error) {
    return (
      <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-[#181a20] border border-[#2b3139] text-gray-500 italic px-4 text-center">
        Chart Error: {error}. Data might be loading or pair is unsupported.
      </div>
    );
  }

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-[400px] md:h-[500px]" 
    />
  );
};

export default Chart;
