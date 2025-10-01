import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, DollarSign, PieChart, CalendarDays, BarChart3 } from 'lucide-react';

export default function App() {
  const [inputs, setInputs] = useState({
    weight: 100,
    oldPawnPrice: 280,
    currentPrice: 350,
    loanPercent: 80,
    feeBasis: 'marhun',
    feeRate: 0.85,
    oldPawnDate: '',
    newPawnDate: '',
    ath: 400,
    marketStatus: 'wait',
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
    const { weight, oldPawnPrice, currentPrice, loanPercent, feeRate, ath, olScore } = inputs;
    const allInputsValid = [weight, oldPawnPrice, currentPrice, loanPercent, feeRate, ath, olScore].every(val =>
      typeof val === 'number' && !isNaN(val) && val >= 0
    );
    if (allInputsValid && (duration.months > 0 || duration.days > 0)) {
      calculateResults();
    } else {
      setResults(null);
    }
    // eslint-disable-next-line
  }, [inputs, duration]);

  const calculateResults = () => {
    const { weight, oldPawnPrice, currentPrice, loanPercent, feeBasis, feeRate, ath, marketStatus, olScore } = inputs;
    const currentValue = weight * currentPrice;
    const newLoanAmount = (currentValue * loanPercent) / 100;
    const oldLoanAmount = (weight * oldPawnPrice * loanPercent) / 100;
    const loanDifference = newLoanAmount - oldLoanAmount;
    const feeCalculationBase = feeBasis === 'marhun' ? currentValue : newLoanAmount;
    const calculatedMonthlyFee = feeCalculationBase * (feeRate / 100);
    const totalFees = (calculatedMonthlyFee * duration.months) + ((calculatedMonthlyFee / 30) * duration.days);
    const netProfit = loanDifference - totalFees;
    const profitMargin = oldLoanAmount > 0 ? (netProfit / oldLoanAmount) * 100 : 0;
    let riskLevel, recommendation, signal;
    const athDistance = ath > 0 ? ((ath - currentPrice) / ath) * 100 : 100;
    if (marketStatus === 'avoid' || olScore < 3) {
      riskLevel = 'EXTREME';
      recommendation = 'JANGAN OVERLAP - SIGNAL PASARAN NEGATIF';
      signal = 'red';
    } else if (marketStatus === 'caution' || olScore < 5) {
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
    if (!isNaN(numValue) && numValue >= 0) { setInputs(prev => ({...prev, [field]: numValue})); }
  };

  const formatRM = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '';
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const SignalBadge = ({signal, text}) => {
    const colors = { green: 'bg-green-100 text-green-800 border-green-300', yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300', orange: 'bg-orange-100 text-orange-800 border-orange-300', red: 'bg-red-100 text-red-800 border-red-300' };
    return (<div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 font-semibold ${colors[signal]}`}>{signal === 'green' && <CheckCircle className="w-5 h-5 mr-2" />}{signal === 'red' && <AlertTriangle className="w-5 h-5 mr-2" />}{(signal === 'yellow' || signal === 'orange') && <Info className="w-5 h-5 mr-2" />}{text}</div>);
  };

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
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><DollarSign className="w-6 h-6 mr-2 text-amber-500" />Input Pajakan</h2>
                <div className="space-y-5">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Berat Emas (gram)</label><input type="number" value={inputs.weight} onChange={(e) => handleInputChange('weight', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Harga Pajak Lama (RM/gram)</label><input type="number" value={inputs.oldPawnPrice} onChange={(e) => handleInputChange('oldPawnPrice', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Peratusan Pinjaman (%)</label><input type="number" value={inputs.loanPercent} onChange={(e) => handleInputChange('loanPercent', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" /></div>
                </div>
              </div>
              <div className="bg-sky-50 p-4 rounded-lg border-2 border-sky-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><BarChart3 className="w-6 h-6 mr-2 text-sky-500" />Input Pasaran (dari TradingView)</h2>
                <div className="space-y-5">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Harga Semasa (RM/gram)</label><input type="number" value={inputs.currentPrice} onChange={(e) => handleInputChange('currentPrice', e.target.value)} className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-amber-50" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Harga ATH Rujukan (RM/gram)</label><input type="number" value={inputs.ath} onChange={(e) => handleInputChange('ath', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Status Pasaran Semasa</label><select value={inputs.marketStatus} onChange={(e) => handleInputChange('marketStatus', e.target.value)} className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"><option value="safe">🟢 SAFE TO OL (Selamat)</option><option value="caution">🟡 CAUTION (Berhati-hati)</option><option value="avoid">🔴 AVOID OL (Elakkan)</option><option value="wait">⚪ WAIT (Tunggu)</option></select></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Skor OL ({inputs.olScore}/10)</label><input type="range" min="0" max="10" step="0.5" value={inputs.olScore} onChange={(e) => handleInputChange('olScore', e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" /></div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200"><p className="text-sm font-semibold text-gray-700 mb-3">Konfigurasi Upah & Tempoh</p><div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-gray-600 mb-1">Asas Kiraan Upah</label><select value={inputs.feeBasis} onChange={(e) => handleInputChange('feeBasis', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"><option value="marhun">Nilai Marhun</option><option value="pinjaman">Jumlah Pinjaman</option></select></div><div><label className="block text-xs font-medium text-gray-600 mb-1">Kadar Upah (%)</label><input type="number" value={inputs.feeRate} onChange={(e) => handleInputChange('feeRate', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" step="0.01"/></div></div><div className="grid sm:grid-cols-2 gap-4 mt-4"><div><label className="block text-xs font-medium text-gray-600 mb-1">Tarikh Pajak Lama</label><input type="date" value={inputs.oldPawnDate} onChange={(e) => handleInputChange('oldPawnDate', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"/></div><div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tarikh Pajak Baru</label>
                    <input type="date" value={inputs.newPawnDate} onChange={(e) => handleInputChange('newPawnDate', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"/></div></div><div className="mt-3 flex items-center text-gray-600"><CalendarDays className="w-5 h-5 mr-2 text-amber-500"/><p className="text-sm">Tempoh: <span className="font-bold">{duration.months} bulan {duration.days} hari</span></p></div></div>
            </div>
            {results ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white"><h2 className="text-2xl font-bold mb-4 flex items-center"><PieChart className="w-6 h-6 mr-2" />Ringkasan Keuntungan</h2><div className="grid grid-cols-2 gap-4 mb-4"><div className="bg-white/20 rounded-lg p-3"><p className="text-sm opacity-90">Pinjaman Lama</p><p className="text-xl font-bold">{formatRM(results.oldLoanAmount)}</p></div><div className="bg-white/20 rounded-lg p-3"><p className="text-sm opacity-90">Pinjaman Baru</p><p className="text-xl font-bold">{formatRM(results.newLoanAmount)}</p></div><div className="bg-white/20 rounded-lg p-3"><p className="text-sm opacity-90">Wang Tambahan</p><p className="text-xl font-bold">{formatRM(results.loanDifference)}</p></div><div className="bg-white/20 rounded-lg p-3"><p className="text-sm opacity-90">Jumlah Kos Upah</p><p className="text-xl font-bold">{formatRM(results.totalFees)}</p></div></div><div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm"><p className="text-sm opacity-90 mb-1">UNTUNG BERSIH OVERLAP</p><p className="text-4xl font-bold flex items-center">{formatRM(results.netProfit)}{results.netProfit > 0 ? (<TrendingUp className="w-8 h-8 ml-2" />) : (<TrendingDown className="w-8 h-8 ml-2" />)}</p><p className="text-lg mt-1">ROI: {results.profitMargin.toFixed(2)}%</p></div></div>
                <div className="bg-white rounded-2xl shadow-xl p-6"><h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Cadangan & Analisa Risiko</h3><div className="mb-4"><SignalBadge signal={results.signal} text={results.recommendation} /></div><div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-600">Risk Level</p><p className="text-lg font-bold text-gray-800">{results.riskLevel}</p></div><div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-600">Jarak dari ATH</p><p className="text-lg font-bold text-gray-800">{results.athDistance.toFixed(1)}%</p></div></div></div>
              </div>
            ) : (<div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center h-full"><PieChart className="w-16 h-16 text-gray-300 mb-4" /><h3 className="text-xl font-bold text-gray-700">Menunggu Input Lengkap</h3><p className="text-gray-500 mt-2">Sila masukkan semua maklumat pajakan dan pasaran untuk melihat hasil pengiraan.</p></div>)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 Panduan Overlap Ar-Rahnu</h2>
            <div className="space-y-6">
              <section><h3 className="text-xl font-bold text-amber-600 mb-3">✅ Bila Masa SESUAI Overlap?</h3><div className="bg-green-50 border-l-4 border-green-500 p-4 rounded"><ul className="space-y-2 text-gray-700"><li className="flex items-start"><span className="text-green-600 mr-2">•</span><span><strong>Selepas pullback</strong> - Harga turun dari peak, bounce dari support, confirm uptrend continue</span></li><li className="flex items-start"><span className="text-green-600 mr-2">•</span><span><strong>Dalam uptrend</strong> - Trend naik confirmed dengan higher highs</span></li><li className="flex items-start"><span className="text-green-600 mr-2">•</span><span><strong>Jauh dari ATH</strong> - Minimum 15-20% dari all-time high</span></li><li className="flex items-start"><span className="text-green-600 mr-2">•</span><span><strong>Ada catalyst bullish</strong> - News positif untuk emas (Fed rate cut, geopolitical tension)</span></li></ul></div></section>
              <section><h3 className="text-xl font-bold text-red-600 mb-3">❌ Bila JANGAN Overlap?</h3><div className="bg-red-50 border-l-4 border-red-500 p-4 rounded"><ul className="space-y-2 text-gray-700"><li className="flex items-start"><span className="text-red-600 mr-2">•</span><span><strong>Masa ATH</strong> - Harga di all-time high atau dekat sangat (95%+ dari ATH)</span></li><li className="flex items-start"><span className="text-red-600 mr-2">•</span><span><strong>Downtrend</strong> - Pattern lower highs dan lower lows</span></li><li className="flex items-start"><span className="text-red-600 mr-2">•</span><span><strong>News negatif</strong> - Fed hawkish, USD mengukuh, inflation turun</span></li><li className="flex items-start"><span className="text-red-600 mr-2">•</span><span><strong>Tak mampu bayar upah</strong> - Cashflow tak mencukupi untuk maintain</span></li></ul></div></section>
            </div>
          </div>
        )}
        <div className="mt-8 text-center text-sm text-gray-600"><p>⚠️ Disclaimer: Ini adalah alat bantuan sahaja. Sentiasa buat kajian sendiri (DYOR).</p></div>
      </div>
    </div>
  );
}
