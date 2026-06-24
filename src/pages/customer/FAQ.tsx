import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, Sparkles, ShieldCheck, Wrench, CreditCard, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'booking' | 'pricing' | 'verification';
}

const FAQS: FAQItem[] = [
  {
    category: 'general',
    question: 'What is Carmerica?',
    answer: 'Carmerica is an AI-assisted vehicle lifecycle management platform. We connect car owners with verified mechanical service centers and use machine learning to suggest fair service estimates, track vehicle health histories, and secure seamless bookings.'
  },
  {
    category: 'pricing',
    question: 'How does the AI Price Estimator work?',
    answer: 'Our AI analyzes local pricing indices, service complexity, vehicle make/model/year, and market trends to compute a recommended fair range. This helps prevent price gouging and ensures both customers and vendors get a fair deal.'
  },
  {
    category: 'verification',
    question: 'How do you verify garages?',
    answer: 'Every garage on Carmerica goes through a strict Know Your Vendor (KYV) verification process. We verify business licenses, inspect facility certifications, and monitor consumer reviews to ensure only trusted professionals are listed.'
  },
  {
    category: 'booking',
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Yes! You can reschedule or cancel bookings directly from your "My Bookings" dashboard. Rescheduling is free up to 24 hours before your slot. Late cancellations may be subject to the garage\'s specific policy.'
  },
  {
    category: 'pricing',
    question: 'Are there any hidden fees?',
    answer: 'No. Carmerica believes in total transparency. The service quotes you see include standard parts, labor, and platform fees. Any extra work recommended by the technician during inspection will require your explicit approval in-app before proceeding.'
  },
  {
    category: 'booking',
    question: 'How do I pay for my service?',
    answer: 'You can pay securely online via credit card or digital wallets during checkout, or choose to pay at the garage. Pre-paying online locks in your slot and makes drop-off/pick-up completely contactless.'
  }
];

export default function FAQ() {
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'booking' | 'pricing' | 'verification'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // 3D Card mouse tilt states
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const [faqTilts, setFaqTilts] = useState<Record<number, { x: number; y: number }>>({});

  const filteredFaqs = FAQS.filter(faq => {
    const matchesTab = activeTab === 'all' || faq.category === activeTab;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* 3D Header Section */}
      <div 
        onMouseMove={(e) => {
          const card = e.currentTarget;
          const box = card.getBoundingClientRect();
          const x = e.clientX - box.left - box.width / 2;
          const y = e.clientY - box.top - box.height / 2;
          const factorX = 10 / (box.height / 2);
          const factorY = 10 / (box.width / 2);
          setHeroTilt({ x: -y * factorX, y: x * factorY });
        }}
        onMouseLeave={() => setHeroTilt({ x: 0, y: 0 })}
        style={{
          transform: `perspective(1000px) rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="bg-gradient-to-tr from-[#003580] to-blue-900 text-white rounded-[3rem] p-8 md:p-12 mb-16 shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" /> Community Support
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ transform: 'translateZ(30px)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-blue-100 text-base md:text-lg leading-relaxed" style={{ transform: 'translateZ(20px)' }}>
            Have questions about bookings, pricing, or garage verification? We have answers. Find everything you need to know below.
          </p>
        </div>
        
        {/* Background Decorative Rings */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 border border-white/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/6 w-64 h-64 border border-white/15 rounded-full pointer-events-none shadow-[inset_0_0_50px_rgba(255,255,255,0.05)]" />
      </div>

      {/* Interactive Controls */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
          {/* Categories Tab */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All FAQs' },
              { id: 'general', label: 'General' },
              { id: 'booking', label: 'Bookings' },
              { id: 'pricing', label: 'AI Pricing' },
              { id: 'verification', label: 'Verifications' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setOpenIndex(null);
                }}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer active:scale-95",
                  activeTab === tab.id 
                    ? "bg-[#003580] text-white shadow-lg shadow-blue-900/10" 
                    : "bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-100"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-[#003580] focus:ring-1 focus:ring-[#003580] outline-none shadow-sm transition-all"
            />
          </div>
        </div>

        {/* FAQs Accordion List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col items-center">
              <HelpCircle className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No matching questions found</h3>
              <p className="text-sm text-gray-400 max-w-xs text-center">Try refining your search terms or selecting a different category tab.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const tilt = faqTilts[index] || { x: 0, y: 0 };
              
              return (
                <div
                  key={index}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const box = card.getBoundingClientRect();
                    const x = e.clientX - box.left - box.width / 2;
                    const y = e.clientY - box.top - box.height / 2;
                    // Low scale rotation to keep it smooth
                    const factorX = 4 / (box.height / 2);
                    const factorY = 4 / (box.width / 2);
                    setFaqTilts(prev => ({
                      ...prev,
                      [index]: { x: -y * factorX, y: x * factorY }
                    }));
                  }}
                  onMouseLeave={() => setFaqTilts(prev => ({
                    ...prev,
                    [index]: { x: 0, y: 0 }
                  }))}
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: 'transform 0.15s ease-out',
                    transformStyle: 'preserve-3d',
                  }}
                  className={cn(
                    "bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md",
                    isOpen ? "border-[#003580]/30 shadow-md" : "border-gray-100"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-6 md:px-8 md:py-6 flex items-center justify-between text-left cursor-pointer outline-none focus:bg-gray-50/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        isOpen ? "bg-blue-50 text-[#003580]" : "bg-gray-50 text-gray-400"
                      )}>
                        {faq.category === 'pricing' && <Sparkles className="h-5 w-5" />}
                        {faq.category === 'verification' && <ShieldCheck className="h-5 w-5" />}
                        {faq.category === 'booking' && <Wrench className="h-5 w-5" />}
                        {faq.category === 'general' && <HelpCircle className="h-5 w-5" />}
                      </div>
                      <span className="font-bold text-gray-900 text-sm md:text-base pr-4">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "h-5 w-5 text-gray-400 transition-transform duration-300 shrink-0",
                      isOpen && "rotate-180 text-[#003580]"
                    )} />
                  </button>

                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pt-2 pl-[4.5rem] pr-8 text-sm md:text-base text-gray-500 leading-relaxed border-t border-gray-50">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
