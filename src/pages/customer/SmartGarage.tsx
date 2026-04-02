import React from 'react';
import { 
  Car, 
  Camera, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Wrench, 
  Plus, 
  ChevronRight, 
  Zap, 
  Info,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

const SmartGarage = () => {
  const [activeVehicle, setActiveVehicle] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [identifiedPart, setIdentifiedPart] = React.useState<null | { name: string; confidence: number; oem: string }>(null);

  const vehicles = [
    { id: 1, make: 'Toyota', model: 'Camry', year: 2022, vin: '4T1BF1FKXNU******', mileage: '24,500 km', status: 'Healthy' },
    { id: 2, make: 'Tesla', model: 'Model 3', year: 2023, vin: '5YJ3E1EBXPF******', mileage: '12,200 km', status: 'Service Due' }
  ];

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIdentifiedPart({
        name: 'Front Brake Pads',
        confidence: 0.98,
        oem: '04465-06150'
      });
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Car className="h-8 w-8 mr-3 text-red-600" />
            My Smart Garage
          </h1>
          <p className="text-gray-500 mt-2">AI-powered vehicle lifecycle management and part identification.</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center">
          <Plus className="h-5 w-5 mr-2" /> Add New Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Vehicle List & Fitment */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
                Vehicle Fitment AI
              </h2>
              <p className="text-xs text-gray-500 mt-1">Ensuring 100% part compatibility</p>
            </div>
            <div className="p-4 space-y-3">
              {vehicles.map((v, i) => (
                <button 
                  key={v.id}
                  onClick={() => setActiveVehicle(i)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all text-left group",
                    activeVehicle === i 
                      ? "border-red-600 bg-red-50/50 shadow-md" 
                      : "border-gray-100 hover:border-red-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={cn("font-bold", activeVehicle === i ? "text-red-600" : "text-gray-900")}>
                        {v.year} {v.make} {v.model}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{v.vin}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                      v.status === 'Healthy' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {v.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-400">
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {v.mileage}</span>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", activeVehicle === i && "translate-x-1")} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Lifecycle Reminders */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Service Reminders
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Wrench className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">30,000 km Major Service</p>
                  <p className="text-xs text-blue-700 mt-1">Estimated in 2 months based on your driving patterns.</p>
                  <button className="mt-3 text-xs font-bold text-blue-600 hover:underline">Book Now →</button>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-900">Resale Value Alert</p>
                  <p className="text-xs text-yellow-700 mt-1">Your car's market value is currently at a peak. View valuation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Part ID & Diagnostics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Visual Part Identification AI */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-red-600 to-red-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <Camera className="h-6 w-6 mr-3" />
                    Visual Part Identification AI
                  </h2>
                  <p className="text-red-100 mt-1">Upload a photo to identify any car part and find replacements.</p>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold">
                  <Zap className="h-4 w-4 fill-current text-yellow-400" />
                  <span>Real-time Detection</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {!identifiedPart ? (
                <div 
                  onClick={handleUpload}
                  className={cn(
                    "border-4 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all",
                    isUploading ? "border-red-200 bg-red-50/20" : "border-gray-100 hover:border-red-200 hover:bg-gray-50"
                  )}
                >
                  {isUploading ? (
                    <div className="text-center">
                      <div className="h-16 w-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="font-bold text-gray-900">AI is analyzing your image...</p>
                      <p className="text-xs text-gray-500 mt-2">Detecting part name and OEM specifications</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-red-50 p-6 rounded-full mb-6">
                        <Upload className="h-10 w-10 text-red-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">Click to upload or drag & drop</p>
                      <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG (Max 10MB)</p>
                      <div className="mt-8 flex gap-4">
                        <button className="bg-white border border-gray-200 px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center">
                          <Camera className="h-4 w-4 mr-2" /> Use Camera
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/2 relative rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                      <img src="https://picsum.photos/seed/brakepad/800/600" alt="Detected Part" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-red-600/10" />
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-red-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                        <span className="absolute -top-8 left-0 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                          Detected: Brake Pad
                        </span>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 space-y-6">
                      <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm font-bold text-green-900">AI Confidence: {(identifiedPart.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <button onClick={() => setIdentifiedPart(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Reset</button>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{identifiedPart.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 font-mono">OEM: {identifiedPart.oem}</p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-bold text-gray-900">Suggested Replacements:</p>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mr-3 border border-gray-100">
                              <Settings className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Genuine Toyota Brake Pads</p>
                              <p className="text-xs text-green-600 font-bold">100% Compatible</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-red-600 group-hover:translate-x-1 transition-transform">AED 245 →</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mr-3 border border-gray-100">
                              <Settings className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Brembo Performance Pads</p>
                              <p className="text-xs text-blue-600 font-bold">Performance Upgrade</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-red-600 group-hover:translate-x-1 transition-transform">AED 480 →</span>
                        </div>
                      </div>

                      <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-100">
                        Find Nearby Installation Shops
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Maintenance Builder */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500 fill-current" />
                  Smart Maintenance Bundles
                </h2>
                <p className="text-sm text-gray-500 mt-1">AI-suggested kits for your specific vehicle mileage.</p>
              </div>
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Save up to 15%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl border-2 border-red-600 bg-red-50/30 relative">
                <div className="absolute -top-3 right-6 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Recommended
                </div>
                <h4 className="font-bold text-gray-900 text-lg">25,000 km Service Kit</h4>
                <p className="text-xs text-gray-500 mt-1">Everything you need for your next service.</p>
                <ul className="mt-4 space-y-2">
                  <li className="text-sm text-gray-700 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Synthetic Oil (5L)</li>
                  <li className="text-sm text-gray-700 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Genuine Oil Filter</li>
                  <li className="text-sm text-gray-700 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Air Filter Replacement</li>
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 line-through">AED 450</p>
                    <p className="text-xl font-bold text-gray-900">AED 385</p>
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700">Add Bundle</button>
                </div>
              </div>
              
              <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all">
                <h4 className="font-bold text-gray-900 text-lg">Brake Refresh Kit</h4>
                <p className="text-xs text-gray-500 mt-1">Front & Rear brake maintenance.</p>
                <ul className="mt-4 space-y-2">
                  <li className="text-sm text-gray-700 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Front Brake Pads</li>
                  <li className="text-sm text-gray-700 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Brake Fluid Flush</li>
                  <li className="text-sm text-gray-700 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Rotor Inspection</li>
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 line-through">AED 620</p>
                    <p className="text-xl font-bold text-gray-900">AED 540</p>
                  </div>
                  <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50">Add Bundle</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartGarage;
