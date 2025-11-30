import React, { useState } from 'react';
import { KeywordEntry, SearchIntent, KeywordType } from '../types';
import { ArrowDown, ArrowUp, Download, Search } from 'lucide-react';

interface KeywordTableProps {
  data: KeywordEntry[];
}

type SortField = keyof KeywordEntry;
type SortDirection = 'asc' | 'desc';

export const KeywordTable: React.FC<KeywordTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('priorityScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterIntent, setFilterIntent] = useState<string>('All');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for new fields usually better for numbers
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIntent = filterIntent === 'All' || item.searchIntent === filterIntent;
    return matchesSearch && matchesIntent;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // String comparison
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();
    
    if (aString < bString) return sortDirection === 'asc' ? -1 : 1;
    if (aString > bString) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const downloadCSV = () => {
    const headers = ['Keyword', 'Type', 'Intent', 'Score', 'Importance'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => 
        `"${row.keyword}","${row.keywordType}","${row.searchIntent}",${row.priorityScore},"${row.importance}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'keywords.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case SearchIntent.Informational: return 'bg-blue-100 text-blue-700 border-blue-200';
      case SearchIntent.Transactional: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case SearchIntent.Commercial: return 'bg-purple-100 text-purple-700 border-purple-200';
      case SearchIntent.Navigational: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 font-bold';
    if (score >= 50) return 'text-amber-600 font-medium';
    return 'text-slate-500';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-30" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter keywords..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            value={filterIntent}
            onChange={(e) => setFilterIntent(e.target.value)}
          >
            <option value="All">All Intents</option>
            <option value={SearchIntent.Informational}>Informational</option>
            <option value={SearchIntent.Commercial}>Commercial</option>
            <option value={SearchIntent.Transactional}>Transactional</option>
            <option value={SearchIntent.Navigational}>Navigational</option>
          </select>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Table Header */}
      <div className="overflow-x-auto custom-scrollbar flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <th 
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none sticky top-0 bg-slate-50 z-10"
                onClick={() => handleSort('keyword')}
              >
                <div className="flex items-center">Keyword <SortIcon field="keyword" /></div>
              </th>
              <th 
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none sticky top-0 bg-slate-50 z-10"
                onClick={() => handleSort('keywordType')}
              >
                <div className="flex items-center">Type <SortIcon field="keywordType" /></div>
              </th>
              <th 
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none sticky top-0 bg-slate-50 z-10"
                onClick={() => handleSort('searchIntent')}
              >
                <div className="flex items-center">Intent <SortIcon field="searchIntent" /></div>
              </th>
              <th 
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none sticky top-0 bg-slate-50 z-10 text-right"
                onClick={() => handleSort('priorityScore')}
              >
                <div className="flex items-center justify-end">Priority <SortIcon field="priorityScore" /></div>
              </th>
              <th className="p-4 sticky top-0 bg-slate-50 z-10">Why it matters</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-4 font-medium text-slate-800">{row.keyword}</td>
                <td className="p-4 text-slate-600">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs border border-slate-200">
                    {row.keywordType}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getIntentColor(row.searchIntent)}`}>
                    {row.searchIntent}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${row.priorityScore > 70 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${row.priorityScore}%` }}
                      ></div>
                    </div>
                    <span className={getScoreColor(row.priorityScore)}>{row.priorityScore}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-500 text-xs italic max-w-xs truncate" title={row.importance}>
                  {row.importance}
                </td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No keywords found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-right">
        Showing {sortedData.length} keywords
      </div>
    </div>
  );
};