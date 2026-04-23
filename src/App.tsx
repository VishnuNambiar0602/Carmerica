import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { VendorLayout } from './components/layout/VendorLayout';
import { AdminLayout } from './components/layout/AdminLayout';

import AIGenie from './components/ai/AIGenie';
import SmartGarage from './pages/customer/SmartGarage';
import Home from './pages/customer/Home';
import SearchResults from './pages/customer/SearchResults';
import GarageDetails from './pages/customer/GarageDetails';
import Checkout from './pages/customer/Checkout';
import Confirmation from './pages/customer/Confirmation';
import MyBookings from './pages/customer/MyBookings';
import Login from './pages/customer/Login';
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

// Placeholder Components
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">This page is under development. UI/UX structure coming soon.</p>
  </div>
);

// Customer Pages
const PackageDetails = () => <Placeholder title="Service Package Details" />;
const Profile = () => <Placeholder title="User Account" />;
const Offers = () => <Placeholder title="Offers / Membership" />;
const Support = () => <Placeholder title="Support / Help Center" />;
const About = () => <Placeholder title="About / Trust Page" />;
const Contact = () => <Placeholder title="Contact Us" />;
const Blog = () => <Placeholder title="Blog / Guides" />;

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
          <Route path="checkout" element={<Checkout />} />
          <Route path="confirmation" element={<Confirmation />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="smart-garage" element={<SmartGarage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="login" element={<Login />} />
          <Route path="offers" element={<Offers />} />
          <Route path="support" element={<Support />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="blog" element={<Blog />} />
        </Route>

        {/* Vendor Routes */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor" element={<VendorLayout />}>
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
        </Route>


        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
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
      <AIGenie />
    </Router>
  );
}

export default App;
