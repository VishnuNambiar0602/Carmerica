import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { VendorLayout } from './components/layout/VendorLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute, VendorProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';

import ChatWidget from './components/ChatWidget';
import GarageMap from './components/GarageMap';
import SmartGarage from './pages/customer/SmartGarage';
import GarageMapPage from './pages/customer/GarageMapPage';
import Home from './pages/customer/Home';
import SearchResults from './pages/customer/SearchResults';
import GarageDetails from './pages/customer/GarageDetails';
import Checkout from './pages/customer/Checkout';
import Confirmation from './pages/customer/Confirmation';
import MyBookings from './pages/customer/MyBookings';
import Support from './pages/customer/Support';
import Login from './pages/customer/Login';
import Profile from './pages/customer/Profile';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorBookings from './pages/vendor/VendorBookings';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorCalendar from './pages/vendor/VendorCalendar';
import VendorServices from './pages/vendor/VendorServices';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorStaff from './pages/vendor/VendorStaff';
import VendorReviews from './pages/vendor/VendorReviews';
import VendorEarnings from './pages/vendor/VendorEarnings';
import VendorPromotions from './pages/vendor/VendorPromotions';
import VendorMessages from './pages/vendor/VendorMessages';
import VendorReports from './pages/vendor/VendorReports';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPricing from './pages/admin/AdminPricing';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminCMS from './pages/admin/AdminCMS';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSupport from './pages/admin/AdminSupport';
import AdminPayments from './pages/admin/AdminPayments';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminVendorKYV from './pages/admin/AdminVendorKYV';
import ForgotPassword from './pages/customer/ForgotPassword';
import VendorForgotPassword from './pages/vendor/VendorForgotPassword';
import VendorRegister from './pages/vendor/VendorRegister';
import VendorGarageSetup from './pages/vendor/VendorGarageSetup';

const SectionCard = ({ title, body, cta, to }: { title: string; body: string; cta: string; to: string }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
    <Link to={to} className="inline-flex mt-4 text-sm font-bold text-[#0071c2] hover:underline">{cta}</Link>
  </div>
);

const PackageDetails = () => (
  <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
    <div className="bg-[#003580] text-white rounded-4xl p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-bold mb-3">Service Package</p>
      <h1 className="text-4xl font-bold mb-4">General Service + AI Bundle</h1>
      <p className="text-white/80 max-w-2xl">An all-in package covering the core service, recommended add-ons, and booking protection.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/checkout" className="bg-white text-[#003580] px-5 py-3 rounded-xl font-bold">Book now</Link>
        <Link to="/search" className="bg-white/10 px-5 py-3 rounded-xl font-bold">Back to search</Link>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SectionCard title="What's included" body="Inspection, oil replacement, filter check, and AI-recommended maintenance items based on vehicle history." cta="View checkout" to="/checkout" />
      <SectionCard title="Trust guarantees" body="Verified vendors, transparent pricing, and booking support for cancellation and rescheduling." cta="Open support" to="/support" />
      <SectionCard title="Vehicle fitment" body="Browse compatible service packages for your make/model before confirming your appointment." cta="Search garages" to="/search" />
    </div>
  </div>
);



const Offers = () => (
  <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Offers & Membership</h1>
      <p className="text-gray-600 mt-2">Curated discounts and loyalty perks for regular servicing.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SectionCard title="Oil change bundle" body="Save on routine maintenance with bundled service pricing." cta="Book a service" to="/search" />
      <SectionCard title="Fleet membership" body="Ideal for frequent drivers and small business vehicle maintenance." cta="View support" to="/support" />
      <SectionCard title="Premium protection" body="Priority booking, cancellation flexibility, and AI price verification." cta="Sign in" to="/login" />
    </div>
  </div>
);



const About = () => (
  <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">About CarServ</h1>
      <p className="text-gray-600 leading-relaxed">CarServ connects drivers with vetted garages, fair pricing, and AI-assisted booking decisions. The platform is built to make servicing simpler, more transparent, and easier to compare.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SectionCard title="Verified vendors" body="We surface garages with trust signals, reviews, and service transparency." cta="Browse garages" to="/search" />
      <SectionCard title="AI-guided decisions" body="Smart recommendations help match the right service to the right vehicle." cta="Read blog" to="/blog" />
      <SectionCard title="Customer-first design" body="Bookings, support, and follow-up are all built around a simple user flow." cta="See offers" to="/offers" />
    </div>
  </div>
);

const Contact = () => (
  <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Contact Us</h1>
      <p className="text-gray-600 leading-relaxed">For booking or account assistance, use support channels in the app or send a request to the team below.</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-gray-50 rounded-2xl"><span className="font-bold">Email</span><div>support@carserv.com</div></div>
        <div className="p-4 bg-gray-50 rounded-2xl"><span className="font-bold">Phone</span><div>+1 (800) 555-0100</div></div>
        <div className="p-4 bg-gray-50 rounded-2xl"><span className="font-bold">Hours</span><div>Mon-Fri, 9am-6pm</div></div>
      </div>
    </div>
  </div>
);

const Blog = () => (
  <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Blog & Guides</h1>
      <p className="text-gray-600 mt-2">Maintenance tips, seasonal advice, and platform updates.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SectionCard title="How to choose a garage" body="Use trust scores, recent reviews, and fair-price indicators to compare service centers." cta="Search garages" to="/search" />
      <SectionCard title="What to service before summer" body="AC, fluids, and tire checks are the biggest priorities for hot-weather driving." cta="View offers" to="/offers" />
      <SectionCard title="How booking works" body="Understand the platform flow from search to checkout and post-service follow-up." cta="Book now" to="/checkout" />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="garage/:id" element={<GarageDetails />} />
          <Route path="package/:id" element={<PackageDetails />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="confirmation" element={<Confirmation />} />
          <Route path="my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="smart-garage" element={<ProtectedRoute><SmartGarage /></ProtectedRoute>} />
          <Route path="garage-map" element={<GarageMapPage />} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="offers" element={<Offers />} />
          <Route path="support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="blog" element={<Blog />} />
        </Route>

        {/* Vendor Routes */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/vendor" element={<VendorProtectedRoute><VendorLayout /></VendorProtectedRoute>}>
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="bookings" element={<VendorBookings />} />
          <Route path="calendar" element={<VendorCalendar />} />
          <Route path="services" element={<VendorServices />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="staff" element={<VendorStaff />} />
          <Route path="reviews" element={<VendorReviews />} />
          <Route path="earnings" element={<VendorEarnings />} />
          <Route path="promotions" element={<VendorPromotions />} />
          <Route path="messages" element={<VendorMessages />} />
          <Route path="reports" element={<VendorReports />} />
          <Route path="garage-setup" element={<VendorGarageSetup />} />
        </Route>


        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="cms" element={<AdminCMS />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="vendor-kyv" element={<AdminVendorKYV />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </Router>
  );
}

export default App;
