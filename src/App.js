import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, DollarSign, PieChart, CalendarDays, BarChart3 } from 'lucide-react';

export default function App() {
  const [inputs, setInputs] = useState({
    weight: 110,
    oldPawnPrice: 565.71,
    currentPawnPrice: 579.82, // Nama baru untuk kejelasan
    loanPercent: 80,
    feeBasis: 'marhun',
    feeRate: 0.85,
    oldPawnDate: '',
    newPawnDate: '',
    // Input baru dari TradingView
    athDistance: -10.0, // Peratusan terus dari TV
    marketStatus: 'avoid',
    olScore: 5
  });

  const [results, setResults] = useState(null);
  const [duration, setDuration] = useState({ months: 0, days: 0 });
  const [activeTab, setActiveTab] = useState('calculator');

  useEffect(() => {
    if (inputs.oldPawnDate && inputs.newPawnDate) {
      const startDate = new Date(inputs.oldPawnDate);
      const endDate = new Date(inputs.newPawnDate);
      if (endDate < startDate) { setDuration({ months: 0, days: 0 }); return; }
      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();
      if (days < 0) { months--; const lastDayOfPrevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); days += lastDayOfPrevMonth; }
      if (months < 0) { years--; months += 12; }
      const totalMonths = (years * 12) + months;
      if (totalMonths >= 0 && days >= 0) { setDuration({ months: totalMonths, days }); } else { setDuration({ months: 0, days: 0 }); }
    } else {
      setDuration({ months: 0, days: 0 });
    }
  }, [inputs.oldPawnDate, inputs.newPawnDate]);

  useEffect(() => {
    const { weight, oldPawnPrice, currentPawnPrice, loanPercent, feeRate, athDistance, olScore } = inputs;
    const allInputsValid = [weight, oldPawnPrice, currentPawnPrice, loanPercent, feeRate, athDistance, olScore].every(val =>
      typeof val === 'number' && !isNaN(val)
    );
    if (allInputsValid && (duration.months > 0 || duration.days > 0)) {
      calculateResults();
    } else {
      setResults(null);
    }
    // eslint-disable-next-line
  }, [inputs, duration]);

  const calculateResults = () => {
    const { weight, oldPawnPrice, currentPawnPrice, loanPercent, feeBasis, feeRate, marketStatus, olScore, athDistance } = inputs;
    const currentValue = weight * currentPawnPrice;
    const newLoanAmount = (currentValue * loanPercent) / 100;
    const oldLoanAmount = (weight * oldPawnPrice * loanPercent) / 100;
    const loanDifference = newLoanAmount - oldLoanAmount;
    const feeCalculationBase = feeBasis === 'marhun' ? currentValue : newLoanAmount;
    const calculatedMonthlyFee = feeCalculationBase * (feeRate / 100);
    const totalFees = (calculatedMonthlyFee * duration.months) + ((calculatedMonthlyFee / 30) * duration.days);
    const netProfit = loanDifference - totalFees;
    const profitMargin = oldLoanAmount > 0 ? (netProfit / oldLoanAmount) * 100 : 0;
    
    let riskLevel, recommendation, signal;
    if (marketStatus === 'avoid' || olScore < 3 || athDistance < 5) {
      riskLevel = 'EXTREME';
      recommendation = 'JANGAN OVERLAP - SIGNAL PASARAN NEGATIF';
      signal = 'red';
    } else if (marketStatus === 'caution' || olScore < 5 || athDistance < 10) {
      riskLevel = 'HIGH';
      recommendation = 'BERISIKO TINGGI - PERLUKAN KAJIAN MENDALAM';
      signal = 'orange';
    } else if (marketStatus === 'safe' && olScore >= 8 && netProfit > 0) {
      riskLevel = 'LOW';
      recommendation = 'PELUANG TERBAIK - SEMUA INDIKATOR POSITIF';
      signal = 'green';
    } else if (marketStatus === 'safe' && olScore >= 6 && netProfit > 0) {
      riskLevel = 'MODERATE';
      recommendation = 'SESUAI UNTUK OVERLAP - POTENSI YANG BAIK';
      signal = 'green';
    } else if (netProfit <= 0 && olScore < 8) {
        riskLevel = 'MODERATE';
        recommendation = 'AWAS - OVERLAP INI MENGALAMI KERUGIAN';
        signal = 'yellow';
    } else {
      riskLevel = 'MODERATE';
      recommendation = 'TUNGGU ISYARAT LEBIH JELAS';
      signal = 'yellow';
    }
    setResults({ oldLoanAmount, newLoanAmount, loanDifference, totalFees, netProfit, profitMargin, breakeven: oldLoanAmount > 0 ? (((oldLoanAmount + totalFees) / weight) / (loanPercent / 100)) : 0, riskLevel, recommendation, signal, athDistance, calculatedMonthlyFee });
  };

  const handleInputChange = (field, value) => {
    if (field === 'oldPawnDate' || field === 'newPawnDate' || field === 'feeBasis' || field === 'marketStatus') {
        setInputs(prev => ({ ...prev, [field]: value }));
        return;
    }
    if (value === '') { setInputs(prev => ({...prev, [field]: ''})); return; }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) { setInputs(prev => ({...prev, [field]: numValue})); }
  };

  const formatRM = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'RM 0.00';
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };
  
  const SignalBadge = ({signal, text}) => {
    const colors = { green: 'bg-green-100 text-green-800 border-green-300', yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300', orange: 'bg-orange-100 text-orange-800 border-orange-300', red: 'bg-red-100 text-red-800 border-red-300' };
    return (<div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 font-semibold ${colors[signal]}`}>{signal === 'green' && <CheckCircle className="w-5 h-5 mr-2" />}{signal === 'red' && <AlertTriangle className="w-5 h-5 mr-2" />}{(signal === 'yellow' || signal === 'orange') && <Info className="w-5 h-5 mr-2" />}{text}</div>);
  };

  const ResultsPlaceholder = () => (
    <div className="space-y-6">
      {/* Placeholder content remains the same */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mb-4 shadow-lg"><Calculator className="w-8 h-8 text-white" /></div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Kalkulator Overlap Ar-Rahnu</h1>
          <p className="text-gray-600">Sahkan potensi keuntungan & risiko overlap anda</p>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('calculator')} className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'calculator' ? 'bg-white shadow-md text-amber-600' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`}><Calculator className="w-5 h-5 inline mr-2" /> Kalkulator</button>
          <button onClick={() => setActiveTab('guide')} className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'guide' ? 'bg-white shadow-md text-amber-600' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`}><Info className="w-5 h-5 inline mr-2" /> Panduan</button>
        </div>
        {activeTab === 'calculator' ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
              
              {/* --- BAHAGIAN INPUT PAJAKAN YANG DISUSUN SEMULA --- */}
              <div className="p-4 rounded-lg border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><DollarSign className="w-6 h-6 mr-2 text-amber-500" />Input Pajakan</h2>
                <div className="space-y-5">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Berat Emas (gram)</label><input type="number" value={inputs.weight} onChange={(e) => handleInputChange('weight', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Peratusan Pinjaman (%)</label><input type="number" value={inputs.loanPercent} onChange={(e) => handleInputChange('loanPercent', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Harga Pajak Lama (RM/gram)</label><input type="number" value={inputs.oldPawnPrice} onChange={(e) => handleInputChange('oldPawnPrice', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" /></div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Penilaian Ar-Rahnu Semasa (RM/gram)</label>
                        <input type="number" value={inputs.currentPawnPrice} onChange={(e) => handleInputChange('currentPawnPrice', e.target.value)} className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-amber-50" />
                        <p className="text-xs text-gray-500 mt-1">💡 Ambil dari harga 'belian/penilaian' di laman web Ar-Rahnu.</p>
                    </div>
                </div>
              </div>

              {/* --- BAHAGIAN INPUT PASARAN YANG FOKUS --- */}
              <div className="bg-sky-50 p-4 rounded-lg border-2 border-sky-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><BarChart3 className="w-6 h-6 mr-2 text-sky-500" />Analisa Pasaran (dari TradingView)</h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jarak dari ATH Pasaran (%)</label>
                        <input type="number" value={inputs.athDistance} onChange={(e) => handleInputChange('athDistance', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" />
                        <p className="text-xs text-gray-500 mt-1">💡 Salin terus dari panel info 'ATH Distance' di TradingView.</p>
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Status Pasaran Semasa</label><select value={inputs.marketStatus} onChange={(e) => handleInputChange('marketStatus', e.target.value)} className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"><option value="safe">🟢 SAFE TO OL (Selamat)</option><option value="caution">🟡 CAUTION (Berhati-hati)</option><option value="avoid">🔴 AVOID OL (Elakkan)</option><option value="wait">⚪ WAIT (Tunggu)</option></select></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Skor OL ({inputs.olScore}/10)</label><input type="range" min="0" max="10" step="0.5" value={inputs.olScore} onChange={(e) => handleInputChange('olScore', e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" /></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">{/* Konfigurasi Upah & Tempoh */}</div>
            </div>
            <div>
              {results ? (
                <div className="space-y-6">{/* Paparan Hasil */}</div>
              ) : (
                <ResultsPlaceholder />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">{/* Bahagian Panduan */}</div>
        )}
        <div className="mt-8 text-center text-sm text-gray-600"><p>⚠️ Disclaimer: Ini adalah alat bantuan sahaja. Sentiasa buat kajian sendiri (DYOR).</p></div>
      </div>
    </div>
  );
}
