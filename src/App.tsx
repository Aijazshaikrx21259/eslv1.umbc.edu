import React, { useState } from 'react';
import { FileText, Upload } from 'lucide-react';

interface NutritionData {
  servingSize?: string;
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  dietaryFiber?: number;
  sugars?: number;
  protein?: number;
}

function App() {
  const [nutritionData, setNutritionData] = useState<NutritionData>({});
  const [fileContent, setFileContent] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        const data: NutritionData = {};
        text.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) {
            data[key.toLowerCase().replace(/\s+/g, '') as keyof NutritionData] = 
              isNaN(Number(value)) ? value : Number(value);
          }
        });
        setNutritionData(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <img 
            src="https://eslumbc.netlify.app/images/umbc-logo.png" 
            alt="UMBC Logo" 
            className="h-12"
          />
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <a href="#" className="text-yellow-400 hover:text-yellow-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" className="text-yellow-400 hover:text-yellow-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-yellow-400 hover:text-yellow-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
              </a>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-48 px-3 py-1 text-gray-900 bg-white rounded-sm text-sm focus:outline-none"
              />
              <div className="absolute right-2 top-1.5">
                <div className="flex items-center gap-2 text-black text-xs">
                  <label className="flex items-center">
                    <input type="radio" name="searchScope" className="form-radio h-2 w-2" defaultChecked />
                    <span className="ml-1">This Site</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="searchScope" className="form-radio h-2 w-2" />
                    <span className="ml-1">All of UMBC</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Department Title */}
      <div className="bg-[url('https://eslumbc.netlify.app/images/yellow-pattern.jpg')] bg-cover py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-sm text-black">College of Engineering and Information Technology</h1>
          <h2 className="text-2xl font-bold text-black">The Ethical Software Lab</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            <a href="#" className="px-4 py-2 text-yellow-400 hover:bg-yellow-400 hover:text-black">Home</a>
            <a href="#" className="px-4 py-2 text-yellow-400 hover:bg-yellow-400 hover:text-black">Service</a>
            <a href="#" className="px-4 py-2 text-yellow-400 hover:bg-yellow-400 hover:text-black">Team</a>
            <a href="#" className="px-4 py-2 text-yellow-400 hover:bg-yellow-400 hover:text-black">Events</a>
            <a href="#" className="px-4 py-2 text-yellow-400 hover:bg-yellow-400 hover:text-black">About</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Digital Nutrition Label Portal</h2>
            <p className="text-gray-600 mb-6">Upload your nutrition data file to generate a standardized nutrition label.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* File Upload Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Nutrition Data</h3>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Text file containing nutrition data</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".txt"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                {fileContent && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">File Content:</h4>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-md text-sm">{fileContent}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Nutrition Label Display */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="max-w-md mx-auto border-2 border-black p-4">
                <h2 className="text-3xl font-bold border-b-8 border-black pb-1 mb-1">
                  Nutrition Facts
                </h2>
                
                {nutritionData.servingSize && (
                  <div className="border-b border-black py-1">
                    <p className="text-sm">Serving Size {nutritionData.servingSize}</p>
                  </div>
                )}

                <div className="border-b-8 border-black py-2">
                  <p className="text-2xl font-bold">
                    Calories {nutritionData.calories || 0}
                  </p>
                </div>

                <div className="space-y-1 pt-2">
                  {Object.entries(nutritionData).map(([key, value]) => {
                    if (key !== 'servingSize' && key !== 'calories') {
                      return (
                        <div key={key} className="border-b border-gray-300 py-1 flex justify-between">
                          <span className="font-bold capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span>{value}g</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-8">
            <div className="col-span-1">
              <img 
                src="https://eslumbc.netlify.app/images/umbc-logo.png" 
                alt="UMBC Logo" 
                className="h-12 mb-4"
              />
              <p className="text-sm">
                University of Maryland, Baltimore County<br />
                1000 Hilltop Circle<br />
                Baltimore, MD 21250
              </p>
              <div className="mt-4">
                <p className="text-sm">Directions & Parking Information</p>
              </div>
            </div>
            <div className="col-span-1">
              <h3 className="text-yellow-400 font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400">About</a></li>
                <li><a href="#" className="hover:text-yellow-400">Career Center</a></li>
                <li><a href="#" className="hover:text-yellow-400">Directory</a></li>
                <li><a href="#" className="hover:text-yellow-400">myUMBC</a></li>
                <li><a href="#" className="hover:text-yellow-400">News</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="text-yellow-400 font-semibold mb-4">Important Contacts</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400">Police (UMBC)</a></li>
                <li><a href="#" className="hover:text-yellow-400">Website Support</a></li>
              </ul>
              <div className="mt-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Emergency Info</h4>
                <p className="text-sm">Emergency: 410-455-5555</p>
              </div>
            </div>
            <div className="col-span-1">
              <div className="bg-yellow-400 text-black p-4 rounded">
                <h3 className="font-bold mb-2">REQUEST INFO</h3>
                <button className="bg-black text-white px-4 py-1 text-sm rounded hover:bg-gray-800 w-full mb-2">
                  APPLY
                </button>
                <div className="text-sm">
                  <p className="mb-2">Top Stories of the Week</p>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Search"
                      className="flex-grow px-2 py-1 text-xs"
                    />
                    <button className="bg-black text-white px-2 py-1 text-xs">
                      GO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-800 text-xs flex justify-between items-center">
            <div className="flex gap-4">
              <a href="#" className="hover:text-yellow-400">Accessibility</a>
              <a href="#" className="hover:text-yellow-400">Equal Opportunity</a>
              <a href="#" className="hover:text-yellow-400">Privacy</a>
              <a href="#" className="hover:text-yellow-400">Title IX</a>
              <a href="#" className="hover:text-yellow-400">Web Accessibility</a>
            </div>
            <div className="flex items-center gap-2">
              <span>Follow UMBC:</span>
              <div className="flex gap-2">
                <a href="#" className="text-white hover:text-yellow-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-yellow-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-yellow-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;