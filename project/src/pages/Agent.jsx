import React, { useState, useEffect } from 'react';
import { FileText, Target, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { agentService, productivityService } from '../services/api';

const Agent = () => {
  const [goal, setGoal] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await productivityService.getRecords();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await agentService.generateReport({
        records: records,
        goal: goal
      });

      setResults(response);
    } catch (err) {
      console.error('Agent error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please ensure the backend is running on http://127.0.0.1:8000');
      } else {
        setError(err.response?.data?.message || 'Failed to generate report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goalSuggestions = [
    'Increase overall productivity by 15% in the next quarter',
    'Identify and eliminate top 3 productivity bottlenecks',
    'Optimize workflow to reduce time waste by 20%',
    'Develop a personalized productivity improvement plan',
    'Analyze current performance and set realistic targets'
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <FileText className="mr-3" size={36} />
            AI Agent Reports
          </h1>
          <p className="text-white/70">
            Generate comprehensive reports and action plans with AI agents based on your productivity data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goal Input */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                Set Your Goal
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Productivity Goal</label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="input-field h-32 resize-none"
                    placeholder="Describe your productivity goal or what you want to achieve..."
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center">
                    <AlertCircle className="text-red-400 mr-2" size={16} />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !goal.trim()}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating Report...' : 'Generate AI Report'}
                </button>
              </form>

              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Goal Suggestions</h4>
                <div className="space-y-2">
                  {goalSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setGoal(suggestion)}
                      className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white text-sm transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <strong>Data Available:</strong> {records.length} records
                </p>
                <p className="text-white/60 text-xs mt-1">
                  The AI agent will analyze your productivity data to create personalized recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BookOpen className="mr-2" size={20} />
                AI Agent Report
              </h3>

              {results ? (
                <div className="space-y-6">
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center mb-6">
                    <CheckCircle className="text-green-400 mr-2" size={20} />
                    <span className="text-green-400">Report generated successfully!</span>
                  </div>

                  {/* Action Plan */}
                  {results.plan && (
                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Target className="mr-2 text-primary-400" size={20} />
                        Action Plan
                      </h4>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
                          {results.plan}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Report */}
                  {results.report && (
                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <FileText className="mr-2 text-secondary-400" size={20} />
                        Detailed Analysis Report
                      </h4>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
                          {results.report}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
                      <h5 className="text-white font-semibold mb-2">Key Metrics</h5>
                      <p className="text-white/70 text-sm">
                        Based on {records.length} productivity calculations
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                      <h5 className="text-white font-semibold mb-2">AI Confidence</h5>
                      <p className="text-white/70 text-sm">
                        High confidence based on available data
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-white/60 py-12">
                  <FileText size={64} className="mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium text-white mb-2">No Report Generated Yet</h4>
                  <p className="text-sm">
                    Set a productivity goal and click "Generate AI Report" to get personalized insights and action plans.
                  </p>
                  
                  {records.length === 0 && (
                    <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        <strong>Note:</strong> You don't have any productivity calculations yet. 
                        Consider creating some calculations first for more accurate reports.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent;