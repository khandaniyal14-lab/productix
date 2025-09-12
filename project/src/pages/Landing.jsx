import { Link } from 'react-router-dom';
import React from 'react';
import {
  Calculator,
  BarChart3,
  MessageCircle,
  FileText,
  ArrowRight,
  Zap,
  Target,
  Brain,
  CheckCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: Calculator,
    title: 'Productivity Calculation',
    description: 'Advanced algorithms track and calculate your productivity metrics with precision.',
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    icon: BarChart3,
    title: 'AI Analysis',
    description: 'Get intelligent insights and predictions about your productivity patterns.',
    color: 'from-purple-500 to-pink-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  {
    icon: MessageCircle,
    title: 'RAG Chatbot',
    description: 'Chat with AI about your productivity data and get personalized recommendations.',
    color: 'from-green-500 to-emerald-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  {
    icon: FileText,
    title: 'AI Agent Reports',
    description: 'Generate comprehensive reports and action plans with AI agents.',
    color: 'from-orange-500 to-red-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  }
];

const benefits = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get instant productivity calculations and AI insights in real-time.',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    icon: Brain,
    title: 'AI-Powered',
    description: 'Advanced machine learning algorithms provide intelligent recommendations.',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    icon: Target,
    title: 'Goal-Oriented',
    description: 'Set targets and track progress with personalized action plans.',
    color: 'from-pink-500 to-red-500'
  }
];

const offerings = [
  'Productivity Chat Bot',
  'Productivity Prediction',
  'Productivity Gaps and Anomalies',
  'Productivity Analytics',
  'Agentic AI to Drive Productivity'
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Headline */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="text-yellow-400 mr-2" size={32} />
                <span className="text-yellow-400 font-semibold text-lg tracking-wide uppercase">
                  AI-Powered Productivity
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Productix
                </span>
              </h1>
              <p className="text-2xl md:text-3xl font-light text-slate-300 mb-2">
                Your Ultimate
              </p>
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Productivity Co-Pilot
              </p>
            </div>

            {/* Subtitle */}
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-slate-200 font-light leading-relaxed mb-6">
                Are YOU Stuck in Low Efficiency, Order Delays and Need to Find
                <span className="font-semibold text-white"> Productivity Boosters</span>?
              </p>
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
                <p className="text-lg text-slate-300">
                  Productix AI is <span className="font-bold text-emerald-400">YOUR</span> Productivity Co-Pilot
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    Basic Version FREE
                  </span>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                    Standard FREE 1 Month Trial
                  </span>
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                    Economical Customization
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/signup"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg px-10 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 inline transition-transform group-hover:translate-x-1" size={20} />
              </Link>

              <Link
                to="/login"
                className="bg-slate-800/50 backdrop-blur-sm text-white font-bold text-lg px-10 py-4 rounded-full border border-slate-600/50 hover:bg-slate-700/50 transition-all duration-300 flex items-center justify-center"
              >
                Login
              </Link>
            </div>
          </div>

          {/* What Productix AI Offers */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-slate-600/30 rounded-3xl p-8">
              <div className="flex items-center justify-center mb-6">
                <TrendingUp className="text-emerald-400 mr-3" size={28} />
                <h2 className="text-3xl font-bold text-white">
                  What Productix AI Offers
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offerings.map((offering, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/30">
                    <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                    <span className="text-slate-200 font-medium text-left">{offering}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Powerful
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Features</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Everything you need to optimize your productivity and achieve your goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden ${feature.bgColor} ${feature.borderColor} border backdrop-blur-sm rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
              >
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> Productix</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}>
                  <benefit.icon className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                  {benefit.title}
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed max-w-sm mx-auto">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
