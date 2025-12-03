"use client";
import React from "react";

export default function WhyChooseSection() {
  const features = [
    {
      icon: "🔍",
      title: "Smart Comparison",
      description: "Our AI-powered system compares rates from 50+ insurers in real-time",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "💰", 
      title: "Maximum Savings",
      description: "Users save an average of $500+ annually on their car insurance",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Get personalized quotes in under 2 minutes, not hours",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: "🛡️",
      title: "Trusted Coverage", 
      description: "Compare plans from top-rated, A+ rated insurance companies",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "📱",
      title: "Mobile Optimized",
      description: "Perfect experience on all devices - phone, tablet, or desktop",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: "🎯",
      title: "Personalized",
      description: "Tailored recommendations based on your specific needs and budget",
      color: "from-red-500 to-pink-500"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Enter ZIP Code",
      description: "Start with your location to find local insurance options",
      icon: "📍"
    },
    {
      step: "2", 
      title: "Answer Questions",
      description: "Quick questionnaire about your vehicle and driving history",
      icon: "❓"
    },
    {
      step: "3",
      title: "Compare Quotes",
      description: "Review personalized quotes side-by-side with coverage details",
      icon: "📊"
    },
    {
      step: "4",
      title: "Save & Switch",
      description: "Choose your plan and switch to better coverage at lower cost",
      icon: "✅"
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Millions Choose</span> Us
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're not just another comparison site. We're your partner in finding the perfect car insurance coverage at the best price.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              {/* Icon with gradient background */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="relative">
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                Get Started in 4 Simple Steps
              </h3>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Our streamlined process makes comparing car insurance quotes faster and easier than ever before.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {process.map((step, index) => (
                <div key={index} className="text-center group">
                  {/* Step number and icon */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all duration-300">
                      <span className="text-3xl mb-2 block">{step.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {step.step}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold mb-3">
                    {step.title}
                  </h4>
                  
                  <p className="text-blue-100 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connector line */}
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-white/30 to-transparent transform -translate-y-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Save on Your Car Insurance?
            </h3>
            <p className="text-gray-600 mb-6">
              Join millions of drivers who have found better coverage at lower prices.
            </p>
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span>🚀</span>
              <span>Start Saving Now</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}