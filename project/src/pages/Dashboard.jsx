import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, BarChart3, MessageCircle, FileText, TrendingUp, Users, Clock, Target } from 'lucide-react';
import { productivityService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCalculations: 0,
    avgProductivity: 0,
    recentAnalyses: 0,
    chatSessions: 0
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1️⃣ Fetch productivity records
      const recordsResponse = await productivityService.getRecords();

      // Flatten { productName: [records] } → single array
      const allRecords = Object.values(recordsResponse).flat();

      // 2️⃣ Sort by date (newest first) and keep last 5
      const sortedRecords = allRecords.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setRecentRecords(sortedRecords.slice(0, 5));

      // 3️⃣ Fetch analysis count
      const analysisResponse = await productivityService.getAnalysisCount();

      // 4️⃣ Calculate stats
      const totalCalculations = allRecords.length;

      // Avg Productivity: parse numeric value safely
      const avgProductivity = totalCalculations > 0
        ? (
          allRecords.reduce((sum, record) => {
            const rawVal = record.combined_productivity || record.combined || "0";
            const numericVal = parseFloat(rawVal.toString().replace(/[^0-9.]/g, ''));
            return sum + (isNaN(numericVal) ? 0 : numericVal);
          }, 0) / totalCalculations
        ).toFixed(2)
        : 0;

      const recentAnalyses = analysisResponse.analysis_count || 0;

      // 5️⃣ Update stats
      setStats({
        totalCalculations,
        avgProductivity,
        recentAnalyses,
        chatSessions: 12 // placeholder until session tracking is implemented
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats({
        totalCalculations: 0,
        avgProductivity: 0,
        recentAnalyses: 0,
        chatSessions: 0
      });
    } finally {
      setLoading(false);
    }
  };



  const quickActions = [
    {
      title: 'Calculate Productivity',
      description: 'Input your data and get instant productivity calculations',
      icon: Calculator,
      link: '/calculate',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'AI Analysis',
      description: 'Get intelligent insights about your productivity patterns',
      icon: BarChart3,
      link: '/analyze',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Chat with AI',
      description: 'Ask questions about your productivity data',
      icon: MessageCircle,
      link: '/chatbot',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Agent Reports',
      description: 'Generate comprehensive reports and action plans',
      icon: FileText,
      link: '/agent',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const statCards = [
    {
      title: 'Total Calculations',
      value: stats.totalCalculations,
      icon: Calculator,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Avg Productivity',
      value: `${stats.avgProductivity}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Analyses Done',
      value: stats.recentAnalyses,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Chat Sessions',
      value: stats.chatSessions,
      icon: MessageCircle,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Welcome back! Here's your productivity overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link} className="card p-6 hover:scale-105 transition-transform duration-200 block">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                  <action.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-white/70 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {false && (
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Calculations</h3>
            {recentRecords.length > 0 ? (
              <div className="space-y-3">
                {recentRecords.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Calculation #{record.id || index + 1}</p>
                      <p className="text-white/60 text-sm">
                        Productivity:{" "}
                        {record.combined_productivity && !isNaN(parseFloat(record.combined_productivity))
                          ? parseFloat(record.combined_productivity).toFixed(2) + "%"
                          : "N/A%"}
                      </p>

                    </div>
                    <div className="text-white/60 text-sm">
                      {record.created_at
                        ? new Date(record.created_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No calculations yet. Start by creating your first calculation!</p>
            )}
          </div>
          )}

          <div className="card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Productivity Tips</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="text-primary-400 mt-1" size={16} />
                <div>
                  <p className="text-white font-medium">Set Clear Goals</p>
                  <p className="text-white/60 text-sm">Define specific, measurable objectives for better tracking.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="text-secondary-400 mt-1" size={16} />
                <div>
                  <p className="text-white font-medium">Time Management</p>
                  <p className="text-white/60 text-sm">Use time-blocking techniques to maximize efficiency.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="text-green-400 mt-1" size={16} />
                <div>
                  <p className="text-white font-medium">Regular Analysis</p>
                  <p className="text-white/60 text-sm">Review your productivity patterns weekly for insights.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;