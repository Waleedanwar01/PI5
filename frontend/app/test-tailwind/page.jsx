"use client";

export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          Tailwind CSS Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test 1</h2>
            <p className="text-gray-600">Basic text styling</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Test Button
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test 2</h2>
            <p className="text-gray-600">Responsive grid</p>
            <div className="mt-4 flex gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test 3</h2>
            <p className="text-gray-600">Color and spacing</p>
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded text-white">
              Gradient Test
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}