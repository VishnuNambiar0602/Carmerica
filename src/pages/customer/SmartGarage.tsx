import React, { useState, useEffect } from 'react';
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
  Settings,
  Activity,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';

const SmartGarage = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [activeVehicle, setActiveVehicle] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [identifiedPart, setIdentifiedPart] = useState<null | { 
    name: string; 
    confidence: number; 
    oem: string;
    condition?: string;
    vulnerability?: string;
    keywords?: string[];
  }>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [modalError, setModalError] = useState('');
  const [decodeSuccess, setDecodeSuccess] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/vehicles', { headers });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDiagnose = async () => {
    if (!vehicles || vehicles.length === 0 || !vehicles[activeVehicle]) return;
    setIsDiagnosing(true);
    const vehicle = vehicles[activeVehicle];
    try {
      const response = await fetch('/api/ai/predict-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          lastServiceDate: vehicle.lastServiceDate || vehicle.last_service_date || '',
          lastServiceType: vehicle.lastServiceType || vehicle.last_service_type || ''
        })
      });
      const data = await response.json();
      setDiagnosis(data);
    } catch (err) {
      console.error('Diagnosis failed', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleDecodeVin = async () => {
    if (vin.length !== 17) {
      setModalError('VIN must be exactly 17 characters');
      return;
    }
    setIsDecoding(true);
    setModalError('');
    setDecodeSuccess('');
    try {
      const res = await fetch(`/api/vehicles/decode-vin/${encodeURIComponent(vin)}`);
      const data = await res.json();
      if (res.ok) {
        setMake(data.make || '');
        setModel(data.model || '');
        if (data.year) setYear(String(data.year));
        if (data.fuelType) setFuelType(data.fuelType);
        setDecodeSuccess('VIN decoded successfully!');
      } else {
        setModalError(data.message || 'VIN decode failed');
      }
    } catch (err) {
      setModalError('Failed to decode VIN');
    } finally {
      setIsDecoding(false);
    }
  };

  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim() || !year.trim()) {
      setModalError('Make, model, and year are required');
      return;
    }
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers,
        body: JSON.stringify({ make, model, year, mileage, vin, color, fuelType })
      });
      const data = await res.json();
      if (res.ok) {
        setVehicles(prev => [data, ...prev]);
        setActiveVehicle(0);
        setShowModal(false);
        setMake('');
        setModel('');
        setYear('');
        setColor('');
        setFuelType('Petrol');
        setMileage('');
        setVin('');
        setModalError('');
        setDecodeSuccess('');
      } else {
        setModalError(data.message || 'Failed to add vehicle');
      }
    } catch (err) {
      setModalError('Network error');
    }
  };

  useEffect(() => {
    setDiagnosis(null);
  }, [activeVehicle]);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setUploadedImage(reader.result as string);
        
        try {
          const response = await fetch('/api/ai/identify-part', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              image: base64String, 
              mimeType: file.type 
            })
          });
          const data = await response.json();
          setIdentifiedPart(data);
        } catch (error) {
          console.error('Vision analysis failed', error);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
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
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center cursor-pointer select-none"
        >
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
              {loadingVehicles ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin h-6 w-6 text-red-600" />
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No Vehicles Added</p>
                  <p className="text-xs text-gray-400 mt-1">Add a vehicle to enable AI diagnostics</p>
                </div>
              ) : (
                vehicles.map((v, i) => (
                  <button 
                    key={v.id}
                    onClick={() => setActiveVehicle(i)}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all text-left group cursor-pointer",
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
                        <p className="text-xs text-gray-500 mt-1 font-mono">{v.vin || 'No VIN'}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                        v.status === 'Healthy' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {v.status || 'Healthy'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-400">
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {v.mileage} km</span>
                      <ChevronRight className={cn("h-4 w-4 transition-transform", activeVehicle === i && "translate-x-1")} />
                    </div>
                  </button>
                ))
              )}
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
                      <img src={uploadedImage || "https://picsum.photos/seed/brakepad/800/600"} alt="Detected Part" className="w-full h-full object-cover" loading="lazy" width="800" height="600" decoding="async" />
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
                        <button onClick={() => { setIdentifiedPart(null); setUploadedImage(null); }} className="text-xs font-bold text-gray-400 hover:text-gray-600">Reset</button>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{identifiedPart.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 font-mono">OEM: {identifiedPart.oem}</p>
                        {identifiedPart.condition && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Condition:</span>
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-full",
                              identifiedPart.condition.toLowerCase().includes('worn') || identifiedPart.condition.toLowerCase().includes('damage')
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            )}>
                              {identifiedPart.condition}
                            </span>
                          </div>
                        )}
                        {identifiedPart.vulnerability && (
                          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100/50 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-900 font-medium leading-relaxed">
                              {identifiedPart.vulnerability}
                            </p>
                          </div>
                        )}
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
                          <span className="text-sm font-bold text-red-600 group-hover:translate-x-1 transition-transform">$245 →</span>
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
                          <span className="text-sm font-bold text-red-600 group-hover:translate-x-1 transition-transform">$480 →</span>
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-red-500" />
                  Predictive Health Scan
                </h2>
                <p className="text-sm text-gray-500 mt-1">AI-driven diagnostics based on your {vehicles[activeVehicle]?.make || 'vehicle'}'s mileage.</p>
              </div>
              {!diagnosis && (
                <button 
                  onClick={handleDiagnose}
                  disabled={isDiagnosing}
                  className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                  {isDiagnosing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Run AI Scan
                </button>
              )}
            </div>

            {diagnosis ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 space-y-6">
                  <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Expert Assessment</p>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                        diagnosis.urgency === 'high' ? "bg-red-100 text-red-700" :
                        diagnosis.urgency === 'medium' ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      )}>
                        Urgency: {diagnosis.urgency}
                      </span>
                    </div>
                    <p className="text-xl font-medium text-gray-900 leading-relaxed italic">
                      "{diagnosis.expertAdvice}"
                    </p>
                    {diagnosis.vulnerabilityAlert && (
                      <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <p className="text-sm text-red-900 font-bold">{diagnosis.vulnerabilityAlert}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diagnosis.predictedNeeds.map((need: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Wrench className="h-5 w-5" />
                          </div>
                          <h4 className="font-bold text-gray-900">{need.item}</h4>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{need.reason}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                          <span className="text-xs text-gray-400 font-medium">Estimated in:</span>
                          <span className="text-sm font-bold text-blue-600">{need.milesRemaining} km</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="p-8 rounded-3xl bg-black text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Activity className="h-16 w-16" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-2">Engine Health</p>
                    <div className="text-6xl font-black mb-2">{diagnosis.engineHealthScore}%</div>
                    <div className="w-full bg-gray-800 h-2 rounded-full mt-4">
                      <div 
                        className="h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000" 
                        style={{ width: `${diagnosis.engineHealthScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-red-200">
                    <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Schedule AI Checkup
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <Activity className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-900">No active diagnosis</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">Run a predictive health scan to see what your vehicle might need in the coming months.</p>
              </div>
            )}
          </div>

          {/* AI Maintenance Builder */}
    </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div 
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const box = card.getBoundingClientRect();
              const x = e.clientX - box.left - box.width / 2;
              const y = e.clientY - box.top - box.height / 2;
              const factorX = 10 / (box.height / 2);
              const factorY = 10 / (box.width / 2);
              setTilt({ x: -y * factorX, y: x * factorY });
            }}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.1s ease-out',
              transformStyle: 'preserve-3d',
            }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header decoration */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white relative">
              <h2 className="text-2xl font-bold flex items-center">
                <Car className="h-6 w-6 mr-3" />
                Add New Vehicle
              </h2>
              <p className="text-red-100 mt-1">Enter your vehicle details or decode your VIN to auto-populate fields.</p>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit} className="p-8 space-y-6">
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-2xl flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              {decodeSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-2xl flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>{decodeSuccess}</span>
                </div>
              )}

              {/* VIN Decode Section */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Decode via VIN</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter 17-character VIN"
                    value={vin}
                    onChange={(e) => {
                      setVin(e.target.value.toUpperCase());
                      setModalError('');
                      setDecodeSuccess('');
                    }}
                    maxLength={17}
                    className="grow p-4 bg-white border border-gray-200 rounded-2xl focus:border-red-600 outline-none font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleDecodeVin}
                    disabled={vin.length !== 17 || isDecoding}
                    className="bg-black text-white px-6 py-4 rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isDecoding && <Loader2 className="h-4 w-4 animate-spin" />}
                    Decode
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Make *</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-red-600 outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model *</label>
                  <input
                    type="text"
                    placeholder="e.g. Camry"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-red-600 outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Year *</label>
                  <input
                    type="number"
                    placeholder="e.g. 2022"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-red-600 outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Mileage (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 24500"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-red-600 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. White"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-red-600 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-red-600 outline-none appearance-none"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default SmartGarage;
