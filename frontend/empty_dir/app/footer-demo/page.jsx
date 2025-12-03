"use client";

import FooterWithBlueForm from '../components/FooterWithBlueForm.jsx';

export default function FooterDemoPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Ocean Theme */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white py-24 overflow-hidden">
                {/* Hero Background Waves */}
                <svg className="absolute bottom-0 left-0 w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.1)" />
                </svg>
                <svg className="absolute bottom-0 left-0 w-full h-16" viewBox="0 0 1200 100" preserveAspectRatio="none" style={{animation: 'wave-slow 10s ease-in-out infinite'}}>
                    <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,100 L0,100 Z" fill="rgba(255,255,255,0.05)" />
                </svg>
                
                <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        🌊 Footer with Ocean Waves
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-8">
                        Experience the new Footer with Blue Form featuring beautiful ocean wave borders.
                        Surf through savings with our enhanced design that flows like ocean waves!
                    </p>
                    <button className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                        🏄‍♂️ Ride the Wave
                    </button>
                </div>
            </div>

            {/* Content Sections */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Form</h3>
                        <p className="text-gray-600 mb-4">
                            Beautiful blue contact form with form validation and submission handling.
                        </p>
                        <ul className="text-sm text-gray-500 space-y-1">
                            <li>• Name and Email (required)</li>
                            <li>• Phone Number (optional)</li>
                            <li>• Message (optional)</li>
                            <li>• Form submission handling</li>
                        </ul>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Info</h3>
                        <p className="text-gray-600 mb-4">
                            Display your contact information with attractive icons and styling.
                        </p>
                        <ul className="text-sm text-gray-500 space-y-1">
                            <li>• Address information</li>
                            <li>• Phone number display</li>
                            <li>• Email contact</li>
                            <li>• Social media links</li>
                        </ul>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Original Footer</h3>
                        <p className="text-gray-600 mb-4">
                            All the original footer functionality and content preserved.
                        </p>
                        <ul className="text-sm text-gray-500 space-y-1">
                            <li>• Company and legal links</li>
                            <li>• Copyright information</li>
                            <li>• Dynamic content loading</li>
                            <li>• Responsive design</li>
                        </ul>
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use</h2>
                    <div className="space-y-4 text-gray-600">
                        <div>
                            <h3 className="font-semibold text-gray-800">1. Import the Component</h3>
                            <code className="bg-gray-100 p-2 rounded block text-sm mt-1">
                                import FooterWithBlueForm from './components/FooterWithBlueForm.jsx';
                            </code>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-gray-800">2. Use in Your Layout</h3>
                            <code className="bg-gray-100 p-2 rounded block text-sm mt-1">
                                <FooterWithBlueForm />
                            </code>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-gray-800">3. Replace Original Footer</h3>
                            <p className="text-sm mt-1">
                                Simply replace your existing Footer component with FooterWithBlueForm 
                                to add the blue form functionality while maintaining all original features.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with Blue Form */}
            <FooterWithBlueForm />
        </div>
    );
}