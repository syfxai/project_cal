import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, DollarSign, PieChart } from 'lucide-react';

export default function App() {
  const [inputs, setInputs] = useState({
    weight: 100,
    oldPawnPrice: 280,
    currentPrice: 350,
    loanPercent: 70,
    monthlyFee: 200,
    holdMonths: 6
  });

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator');

  useEffect(() => {
    const allInputsValid = Object.values(inputs).every(val => 
      typeof val === 'number' && !isNaN(val) && val > 0
    );
    
    if (allInputsValid) {
      calculateResults();
    } else {
      setResults(null);
    }
    // eslint-disable-next-line
  }, [inputs]);

  const calculateResults = () => {
    const {weight, oldPawnPrice, currentPrice, loanPercent, monthlyFee, holdMonths} = inputs;
    
    if (!weight || !oldPawnPrice || !currentPrice || !loanPercent || !monthlyFee || !holdMonths) return;
    
    const oldPawnValue = weight * oldPawnPrice;
    const currentValue = weight * currentPrice;
    const newLoanAmount = (currentValue * loanPercent) / 100;
    const oldLoanAmount = (oldPawnValue * loanPercent) / 100;
    const loanDifference = newLoanAmount - oldLoanAmount;
    const totalFees = monthlyFee * holdMonths;
    const netProfit = loanDifference - totalFees;
    const profitMargin = oldLoanAmount > 0 ? (netProfit / oldLoanAmount) * 100 : 0;
    
    const upScenario = currentPrice * 1.1;
    const downScenario = currentPrice * 0.9;
    const upValue = weight * upScenario;
    const downValue = weight * downScenario;
    const upLoan = (upValue * loanPercent) / 100;
    const downLoan = (downValue * loanPercent) / 100;
    const upProfit = (upLoan - oldLoanAmount) - totalFees;
    const downProfit = (downLoan - oldLoanAmount) - totalFees;
    
    const breakeven = ((oldLoanAmount + totalFees) / weight) / (loanPercent / 100);
    
    const ath = 400;
    const athDistance = ((ath - currentPrice) / ath) * 100;
    const priceIncrease = oldPawnPrice > 0 ? ((currentPrice - oldPawnPrice) / oldPawnPrice) * 100 : 0;
    
    let riskLevel = 'LOW';
    let recommendation = 'SESUAI';
    let signal = 'green';
    
    if (athDistance < 5) {
      riskLevel = 'VERY HIGH';
      recommendation = 'JANGAN OL - TERLALU DEKAT ATH';
      signal = 'red';
    } else if (athDistance < 10) {
      riskLevel = 'HIGH';
      recommendation = 'BERISIKO - HAMPIR ATH';
      signal = 'orange';
    } else if (athDistance < 20) {
      riskLevel = 'MODERATE';
      recommendation = 'BERHATI-HATI - HARGA TINGGI';
      signal = 'yellow';
    } else if (priceIncrease > 5 && athDistance > 20) {
      riskLevel = 'LOW';
      recommendation = 'SESUAI UNTUK OVERLAP';
      signal = 'green';
    }
    
    setResults({ oldLoanAmount, newLoanAmount, loanDifference, totalFees, netProfit, profitMargin, upScenario: {price: upScenario, profit: upProfit}, downScenario: {price: downScenario, profit: downProfit}, breakeven, riskLevel, recommendation, signal, athDistance });
  };

  const handleInputChange = (field, value) => {
    if (value === '') {
      setInputs(prev => ({...prev, [field]: ''}));
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setInputs(prev => ({...prev, [field]: numValue}));
    }
  };

  const formatRM = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '';
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const SignalBadge = ({signal, text}) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      red: 'bg-red-100 text-red-800 border-red-300'
    };
    return (
      <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 font-semibold ${colors[signal]}`}>
        {signal === 'green' && <CheckCircle className="w-5 h-5 mr-2" />}
        {signal === 'red' && <AlertTriangle className="w-5 h-5 mr-2" />}
        {(signal === 'yellow' || signal === 'orange') && <Info className="w-5 h-5 mr-2" />}
        {text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mb-4 shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Kalkulator Overlap Ar-Rahnu</h1>
          <p className="text-gray-600">Analisa keuntungan & risiko overlap emas anda dengan tepat</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('calculator')} className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'calculator' ? 'bg-white shadow-md text-amber-600' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`}>
            <Calculator className="w-5 h-5 inline mr-2" /> Kalkulator
          </button>
          <button onClick={() => setActiveTab('guide')} className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'guide' ? 'bg-white shadow-md text-amber-600' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`}>
            <Info className="w-5 h-5 inline mr-2" /> Panduan
          </button>
        </div>

        {activeTab === 'calculator' ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><DollarSign className="w-6 h-6 mr-2 text-amber-500" />Input Maklumat</h2>
              <div className="space-y-5">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Berat Emas (gram)</label><input type="number" value={inputs.weight} onChange={(e) => handleInputChange('weight', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" placeholder="Contoh: 100" min="0" step="0.01"/></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Harga Pajak Lama (RM/gram)</label><input type="number" value={inputs.oldPawnPrice} onChange={(e) => handleInputChange('oldPawnPrice', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" placeholder="Contoh: 280" min="0" step="0.01"/><p className="text-xs text-gray-500 mt-1">Harga pada surat pajak yang sedia ada</p></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Harga Semasa (RM/gram)</label><input type="number" value={inputs.currentPrice} onChange={(e) => handleInputChange('currentPrice', e.target.value)} className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-amber-50" placeholder="Contoh: 350" min="0" step="0.01"/><p className="text-xs text-gray-500 mt-1">💡 Harga emas hari ini | ATH: RM400/gram</p></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Peratusan Pinjaman (%)</label><input type="number" value={inputs.loanPercent} onChange={(e) => handleInputChange('loanPercent', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" placeholder="Contoh: 70" min="0" max="100" step="1"/><p className="text-xs text-gray-500 mt-1">Biasanya 70-80%</p></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Upah/Ujrah Bulanan (RM)</label><input type="number" value={inputs.monthlyFee} onChange={(e) => handleInputChange('monthlyFee', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" placeholder="Contoh: 200" min="0" step="1"/></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Tempoh Simpan (bulan)</label><input type="number" value={inputs.holdMonths} onChange={(e) => handleInputChange('holdMonths', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" placeholder="Contoh: 6" min="0" step="1"/></div>
              </div>
            </div>
            {results && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-4 flex items-center"><PieChart className="w-6 h-6 mr-2" />Ringkasan Keuntungan</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/20 rounded-lg p-3"><p className="text-sm opacity-90">Pinjaman Lama</p><p className="text-xl font-bold">{formatRM(results.oldLoanAmount)}</p></div>
                    <div className="bg-white/20 rounded-lg p-3"><p className="text-sm opacity-90">Pinjaman Baru</p><p className="text-xl font-bold">{formatRM(results.newLoanAmount)}</p></div>
                    <div className="bg-white/20 rounded-lg p-3"><p className="text-sm opacity-90">Wang Tambahan</p><p className="text-xl font-bold">{formatRM(results.loanDifference)}</p></div>
                    <div className="bg-white/20 rounded-lg p-3"><p className="text-sm opacity-90">Kos Upah</p><p className="text-xl font-bold">{formatRM(results.totalFees)}</p></div>
                  </div>
                  <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm opacity-90 mb-1">UNTUNG BERSIH OVERLAP</p>
                    <p className="text-4xl font-bold flex items-center">{formatRM(results.netProfit)}{results.netProfit > 0 ? (<TrendingUp className="w-8 h-8 ml-2" />) : (<TrendingDown className="w-8 h-8 ml-2" />)}</p>
                    <p className="text-lg mt-1">ROI: {results.profitMargin.toFixed(2)}%</p>
                    <p className="text-xs mt-2 opacity-80">Wang tambahan dapat - kos upah</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Cadangan</h3>
                  <div className="mb-4"><SignalBadge signal={results.signal} text={results.recommendation} /></div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-600">Risk Level</p><p className="text-lg font-bold text-gray-800">{results.riskLevel}</p></div>
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-600">Jarak dari ATH</p><p className="text-lg font-bold text-gray-800">{results.athDistance.toFixed(1)}%</p></div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-900 mb-2">⚠️ Peringatan:</p>
                    <ul className="text-sm text-blue-800 space-y-1"><li>• Pastikan boleh bayar upah setiap bulan</li><li>• Monitor harga emas secara berkala</li><li>• Jangan tamak tunggu ATH untuk overlap</li><li>• Ada emergency fund untuk backup</li></ul>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Analisa Senario</h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2"><span className="font-semibold text-green-900">Jika Harga NAIK 10%</span><TrendingUp className="w-5 h-5 text-green-600" /></div>
                      <p className="text-sm text-green-700 mb-1">Harga: {formatRM(results.upScenario.price)}/gram</p><p className="text-2xl font-bold text-green-900">Untung: {formatRM(results.upScenario.profit)} 🚀</p>
                    </div>
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2"><span className="font-semibold text-red-900">Jika Harga TURUN 10%</span><TrendingDown className="w-5 h-5 text-red-600" /></div>
                      <p className="text-sm text-red-700 mb-1">Harga: {formatRM(results.downScenario.price)}/gram</p><p className="text-2xl font-bold text-red-900">Untung: {formatRM(results.downScenario.profit)} ⚠️</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Harga Breakeven (untuk overlap)</p><p className="text-2xl font-bold text-gray-800">{formatRM(results.breakeven)}/gram</p>
                      <p className="text-xs text-gray-600 mt-1">Harga minimum untuk untung selepas overlap (termasuk upah)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 Panduan Overlap Ar-Rahnu</h2>
            <div className="space-y-6">
              <section><h3 className="text-xl font-bold text-amber-600 mb-3">✅ Bila Masa SESUAI Overlap?</h3><div className="bg-green-50 border-l-4 border-green-500 p-4 rounded"><ul className="space-y-2 text-gray-700"><li className="flex items-start"><span className="text-green-600 mr-2">•</span><span><strong>Selepas pullback</strong> - Harga turun dari peak, bounce dari support, confirm uptrend continue</span></li><li className="flex items-start"><span className="text-green-600 mr-2">•</span><span><strong>Dalam uptrend</strong> - Trend naik confirmed dengan higher highs</span></li><li className="flex items-start"><span className="text-green-600 mr-2">•</span><span><strong>Jauh dari ATH</strong> - Minimum 15-20% dari all-time high</span></li><li className="flex items-start"><span className="text-green-600 mr-2">•</span><span><strong>Ada catalyst bullish</strong> - News positif untuk emas (Fed rate cut, geopolitical tension)</span></li></ul></div></section>
              <section><h3 className="text-xl font-bold text-red-600 mb-3">❌ Bila JANGAN Overlap?</h3><div className="bg-red-50 border-l-4 border-red-500 p-4 rounded"><ul className="space-y-2 text-gray-700"><li className="flex items-start"><span className="text-red-600 mr-2">•</span><span><strong>Masa ATH</strong> - Harga di all-time high atau dekat sangat (95%+ dari ATH)</span></li><li className="flex items-start"><span className="text-red-600 mr-2">•</span><span><strong>Downtrend</strong> - Pattern lower highs dan lower lows</span></li><li className="flex items-start"><span className="text-red-600 mr-2">•</span><span><strong>News negatif</strong> - Fed hawkish, USD mengukuh, inflation turun</span></li><li className="flex items-start"><span className="text-red-600 mr-2">•</span><span><strong>Tak mampu bayar upah</strong> - Cashflow tak mencukupi untuk maintain</span></li></ul></div></section>
              <section><h3 className="text-xl font-bold text-blue-600 mb-3">💡 Tips Penting</h3><div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded"><ul className="space-y-2 text-gray-700"><li className="flex items-start"><span className="text-blue-600 mr-2">1.</span><span><strong>Overlap gradually</strong> - Jangan all-in satu kali, buat bertahap</span></li><li className="flex items-start"><span className="text-blue-600 mr-2">2.</span><span><strong>Set target</strong> - Ada target profit dan cut-loss level</span></li><li className="flex items-start"><span className="text-blue-600 mr-2">3.</span><span><strong>Emergency fund</strong> - Sediakan 6-12 bulan upah sebagai buffer</span></li><li className="flex items-start"><span className="text-blue-600 mr-2">4.</span><span><strong>Monitor market</strong> - Tengok graf dan news setiap hari</span></li><li className="flex items-start"><span className="text-blue-600 mr-2">5.</span><span><strong>Rekod tracking</strong> - Catat semua overlap untuk analisa prestasi</span></li></ul></div></section>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>⚠️ Disclaimer: Ini adalah kalkulator untuk rujukan sahaja. Sentiasa buat kajian sendiri (DYOR).</p>
          <p className="mt-1">Pelaburan emas melibatkan risiko. Nilai boleh naik atau turun.</p>
        </div>
      </div>
    </div>
  );
}