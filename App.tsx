import React, { useState, useMemo } from 'react';
import { generateKeywords } from './services/geminiService';
import { KeywordEntry, GenerationStats } from './types';
import { KeywordTable } from './components/KeywordTable';
import { Dashboard } from './components/Dashboard';
import { Search, Zap, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [seedKeyword, setSeedKeyword] = useState('');
  const [keywords, setKeywords] = useState<KeywordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedKeyword.trim()) return;

    setLoading(true);
    setError(null);
    setKeywords([]);
    setHasSearched(true);

    try {
      const data = await generateKeywords(seedKeyword);
      setKeywords(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate keywords. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stats: GenerationStats | null = useMemo(() => {
    if (keywords.length === 0) return null;

    const intentCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    let totalScore = 0;

    keywords.forEach(k => {
      intentCounts[k.searchIntent] = (intentCounts[k.searchIntent] || 0) + 1;
      typeCounts[k.keywordType] = (typeCounts[k.keywordType] || 0) + 1;
      totalScore += k.priorityScore;
    });

    return {
      totalKeywords: keywords.length,
      avgPriority: Math.round(totalScore / keywords.length),
      intentDistribution: Object.entries(intentCounts).map(([name, value]) => ({ name, value })),
      typeDistribution: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
    };
  }, [keywords]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header / Hero */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              KeywordGenius
            </span>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Search Input Section */}
        <section className={`transition-all duration-500 ease-in-out ${hasSearched ? 'mb-8' : 'min-h-[60vh] flex flex-col justify-center items-center'}`}>
          {!hasSearched && (
             <div className="text-center mb-10 max-w-2xl mx-auto">
               <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                 Unlock Your SEO Potential
               </h1>
               <p className="text-lg text-slate-600">
                 Generate 100+ high-value keywords, analyze search intent, and discover ranking opportunities in seconds.
               </p>
             </div>
          )}

          <div className={`w-full max-w-3xl mx-auto relative z-10 ${hasSearched ? '' : 'transform hover:scale-105 transition-transform duration-300'}`}>
            <form onSubmit={handleGenerate} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-2 flex items-center border border-slate-100">
                <Search className="w-6 h-6 text-slate-400 ml-4" />
                <input
                  type="text"
                  value={seedKeyword}
                  onChange={(e) => setSeedKeyword(e.target.value)}
                  placeholder="Enter a seed keyword (e.g., 'organic coffee', 'crm software')"
                  className="w-full px-4 py-4 text-lg outline-none text-slate-700 placeholder:text-slate-400 bg-transparent rounded-xl"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !seedKeyword.trim()}
                  className={`
                    px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center gap-2
                    ${loading || !seedKeyword.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'}
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            {!hasSearched && (
              <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-slate-500">
                <span>Try:</span>
                <button onClick={() => setSeedKeyword("digital marketing")} className="px-3 py-1 bg-white border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors">digital marketing</button>
                <button onClick={() => setSeedKeyword("vegan recipes")} className="px-3 py-1 bg-white border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors">vegan recipes</button>
                <button onClick={() => setSeedKeyword("home workout")} className="px-3 py-1 bg-white border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors">home workout</button>
              </div>
            )}
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold">Generation Failed</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && !loading && !error && keywords.length > 0 && stats && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">Total Keywords</div>
                  <div className="text-3xl font-bold text-slate-800">{stats.totalKeywords}</div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">Avg Priority</div>
                  <div className="text-3xl font-bold text-indigo-600">{stats.avgPriority}</div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">Top Intent</div>
                  <div className="text-lg font-bold text-slate-800 truncate">
                    {stats.intentDistribution.sort((a,b) => b.value - a.value)[0]?.name || 'N/A'}
                  </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">Dominant Type</div>
                  <div className="text-lg font-bold text-slate-800 truncate">
                     {stats.typeDistribution.sort((a,b) => b.value - a.value)[0]?.name || 'N/A'}
                  </div>
               </div>
            </div>

            {/* Visuals */}
            <Dashboard stats={stats} />

            {/* Main Table */}
            <div className="h-[800px]">
              <KeywordTable data={keywords} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;