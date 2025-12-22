"use client";
import React from "react";

export default function WhyChooseSection() {
  const features = [
    {
      icon: "🔍",
      title: "Smart Comparison",
      description: "Our AI-powered system compares rates from 50+ insurers in real-time",
    },
    {
      icon: "💰", 
      title: "Maximum Savings",
      description: "Users save an average of $500+ annually on their car insurance",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Get personalized quotes in under 2 minutes, not hours",
    },
    {
      icon: "🛡️",
      title: "Trusted Coverage", 
      description: "Compare plans from top-rated, A+ rated insurance companies",
    },
    {
      icon: "📱",
      title: "Mobile Optimized",
      description: "Perfect experience on all devices - phone, tablet, or desktop",
    },
    {
      icon: "🎯",
      title: "Personalized",
      description: "Tailored recommendations based on your specific needs and budget",
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

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-white py-16 lg:py-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-left mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Why <span className="text-sky-600">Millions Choose</span> Us
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-snug">
            We're not just another comparison site. We're your partner in finding the perfect car insurance coverage at the best price.
          </p>
        </div>

        {/* Features Grid - Clean & Simple */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-none p-6 border border-slate-100 hover:border-slate-300 transition-all duration-300 text-left"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-none bg-slate-50 text-slate-900 mb-4 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors duration-300">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-slate-600 leading-snug">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 border border-slate-800 rounded-none p-6 lg:p-10 text-white relative overflow-hidden shadow-2xl">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="relative">
            <div className="text-left mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Get Started in 4 Simple Steps
              </h3>
              <p className="text-slate-300 text-base max-w-2xl leading-snug">
                Our streamlined process makes comparing car insurance quotes faster and easier than ever before.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((step, index) => (
                <div key={index} className="text-left group relative">
                  {/* Step number and icon */}
                  <div className="relative mb-4 inline-block">
                    <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-none flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all duration-300">
                      <span className="text-2xl mb-2 block">{step.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-sky-400 to-blue-500 rounded-none flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mb-2 text-white">
                    {step.title}
                  </h4>
                  
                  <p className="text-slate-300 text-sm leading-snug">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-left mt-12">
          <div className="bg-white rounded-none p-8 shadow-sm border border-slate-200 max-w-full hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Ready to Save on Your Car Insurance?
                    </h3>
                    <p className="text-sm text-slate-600">
                    Join millions of drivers who have found better coverage at lower prices.
                    </p>
                </div>
                <button 
                  onClick={scrollToHero}
                  className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-none transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap text-sm"
                >
                <span>🚀</span>
                <span>Start Saving Now</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}