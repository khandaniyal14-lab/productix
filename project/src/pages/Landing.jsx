import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, BarChart3, MessageCircle, FileText, ArrowRight, Zap, Target, Brain } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Calculator,
      title: 'Productivity Calculation',
      description: 'Calculate and track your productivity metrics with advanced algorithms.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'AI Analysis',
      description: 'Get intelligent insights and predictions about your productivity patterns.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: MessageCircle,
      title: 'RAG Chatbot',
      description: 'Chat with AI about your productivity data and get personalized recommendations.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      title: 'AI Agent Reports',
      description: 'Generate comprehensive reports and action plans with AI agents.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Productix
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-white/90">
                AI-Powered Productivity Co Pilot
              </span>
            </h1>

            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Revolutionize your productivity with AI-powered calculations, intelligent analysis,
              and personalized insights. Upload videos, track metrics, and get actionable recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                Get Started <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </div>
          </div>

          {/* Video Section */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Watch Our Productivity Demo
            </h2>
            <video
              src="/video/intro_video.mp4"  // served directly from public/
              controls
              className="w-full rounded-lg shadow-lg"
              style={{ maxHeight: "400px" }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-white/70">
              Everything you need to optimize your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 hover:scale-105 transition-transform duration-200">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-white/70">
                Get instant productivity calculations and AI insights in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered</h3>
              <p className="text-white/70">
                Advanced machine learning algorithms provide intelligent recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Goal-Oriented</h3>
              <p className="text-white/70">
                Set targets and track progress with personalized action plans.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who have transformed their workflow with Productix AI.
          </p>
          <Link to="/signup" className="bg-white text-primary-600 font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg">
            Start Your Journey Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;