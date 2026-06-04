import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, ShieldCheck, ShoppingBag, 
  ShoppingCart, CreditCard, Edit2, Save, MapPin, Loader2, 
  Sparkles, Trash2, Heart, Star, ChevronRight, CheckCircle2 
} from 'lucide-react';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [cartItem, setCartItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 3D Mouse Tilt State
  const [profileTilt, setProfileTilt] = useState({ x: 0, y: 0 });
  const [ordersTilt, setOrdersTilt] = useState({ x: 0, y: 0 });
  const [cartTilt, setCartTilt] = useState({ x: 0, y: 0 });

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>, setTilt: Function) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const factorX = 5 / (box.height / 2);
    const factorY = 5 / (box.width / 2);
    setTilt({ x: -y * factorX, y: x * factorY });
  };

  const resetTilt = (setTilt: Function) => {
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        navigate('/login');
        return;
      }
      const authData = await authRes.json();
      const currentUser = authData.user;
      setUser(currentUser);
      setEditForm({
        fullName: currentUser.full_name || '',
        phone: currentUser.phone || ''
      });

      // Fetch customer profile details & wishlist
      const profileRes = await fetch(`/api/customer/profile?email=${encodeURIComponent(currentUser.email)}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setWishlist(profileData.wishlist || []);
      }

      // Fetch customer bookings (orders/purchases)
      const bookingsRes = await fetch('/api/customer/bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData || []);
      }

      // Set cart item (either from localStorage or default to a mock diagnostic cart item if empty)
      const savedCart = localStorage.getItem('cart_item');
      if (savedCart) {
        try {
          setCartItem(JSON.parse(savedCart));
        } catch {
          setCartItem(getMockCartItem());
        }
      } else {
        setCartItem(getMockCartItem());
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMockCartItem = () => {
    return {
      id: 'mock-cart-1',
      serviceId: 's2',
      serviceName: 'Oil Change Service',
      garageId: 'garage-1',
      garageName: 'Elite Auto Care',
      price: 49,
      duration: '30 mins',
      addedAt: new Date().toLocaleDateString()
    };
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      setMessage({ type: 'error', text: 'Full name is required' });
      return;
    }
    try {
      setSaveLoading(true);
      setMessage({ type: '', text: '' });
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullName: editForm.fullName,
          phone: editForm.phone
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile due to a network error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleClearCart = () => {
    localStorage.removeItem('cart_item');
    setCartItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-red-600 mx-auto" />
          <p className="font-bold text-gray-900">Loading your profile hub...</p>
        </div>
      </div>
    );
  }

  // Calculate order metrics
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const activeBookings = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled');
  const totalSpend = bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-800 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Customer Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Welcome back, {user?.full_name || 'Driver'}!
          </h1>
          <p className="text-red-100 text-sm md:text-base leading-relaxed">
            Manage your garage appointments, vehicle service history, shopping cart items, and favorite high-trust locations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Card 1: 3D Profile Info Card */}
        <div 
          onMouseMove={(e) => handleTilt(e, setProfileTilt)}
          onMouseLeave={() => resetTilt(setProfileTilt)}
          style={{
            transform: `perspective(1000px) rotateX(${profileTilt.x}deg) rotateY(${profileTilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
          }}
          className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-red-600">
              <User className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Account Information</span>
            </div>

            {/* Profile Detail Layout */}
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-md">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{user?.full_name}</h3>
                    <span className="inline-flex mt-1.5 items-center bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Active Member
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{user?.phone || 'No phone number added'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-600"
                    placeholder="+971-50-000-0000"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={saveLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-red-700 flex items-center justify-center gap-1.5"
                  >
                    {saveLoading ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />} Save
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {message.text && (
              <div className={cn(
                "p-3 rounded-xl text-xs border font-medium mt-4",
                message.type === 'success' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
              )}>
                {message.text}
              </div>
            )}
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full mt-6 border border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile Details
            </button>
          )}
        </div>

        {/* Card 2: 3D Purchases / Orders Card */}
        <div 
          onMouseMove={(e) => handleTilt(e, setOrdersTilt)}
          onMouseLeave={() => resetTilt(setOrdersTilt)}
          style={{
            transform: `perspective(1000px) rotateX(${ordersTilt.x}deg) rotateY(${ordersTilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
          }}
          className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 text-red-600">
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">My Purchases & Orders</span>
              </div>
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                {bookings.length} Total
              </span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-4 rounded-2xl mb-6 text-center">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spent</p>
                <p className="text-sm font-black text-gray-900 mt-1">${totalSpend}</p>
              </div>
              <div className="border-l border-r border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed</p>
                <p className="text-sm font-black text-green-600 mt-1">{completedBookings.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
                <p className="text-sm font-black text-blue-600 mt-1">{activeBookings.length}</p>
              </div>
            </div>

            {/* Bookings List */}
            {bookings.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <CreditCard className="h-10 w-10 text-gray-300 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-gray-900">No Orders Placed Yet</p>
                  <p className="text-xs text-gray-400 mt-1">Book diagnostic or maintenance services for your vehicle.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{booking.service || 'Service'}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{booking.scheduled_date} at {booking.scheduled_time}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        booking.status === 'Completed' ? "bg-green-100 text-green-700" :
                        booking.status === 'Pending' ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {booking.status}
                      </span>
                      <p className="font-bold text-gray-900 mt-1">${booking.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link 
            to="/my-bookings" 
            className="w-full text-center border border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer mt-6"
          >
            Manage All Appointments <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Card 3: 3D Active Cart & Saved Wishlist Card */}
        <div 
          onMouseMove={(e) => handleTilt(e, setCartTilt)}
          onMouseLeave={() => resetTilt(setCartTilt)}
          style={{
            transform: `perspective(1000px) rotateX(${cartTilt.x}deg) rotateY(${cartTilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
          }}
          className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Cart Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-red-600">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Active Shopping Cart</span>
                </div>
                {cartItem && (
                  <button 
                    onClick={handleClearCart}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-gray-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {cartItem ? (
                <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100/50 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{cartItem.serviceName}</p>
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center font-bold uppercase tracking-wider">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" /> {cartItem.garageName}
                      </p>
                    </div>
                    <span className="font-black text-gray-900 text-sm">${cartItem.price}</span>
                  </div>
                  <Link 
                    to={`/checkout?garageId=${cartItem.garageId}&serviceId=${cartItem.serviceId}`}
                    className="bg-red-600 text-white py-2.5 rounded-xl text-center text-xs font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 fill-current" /> Complete Checkout
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cart is empty</p>
                </div>
              )}
            </div>

            {/* Saved/Wishlist Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-red-600">
                <Heart className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Saved Garages</span>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No saved garages</p>
                  <Link to="/search" className="text-[10px] text-red-600 font-bold hover:underline block mt-1">Explore garages now</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlist.slice(0, 2).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => navigate(`/garage/${item.garage_id || 'garage-1'}`)}
                      className="p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                    >
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{item.garage_name || 'Elite Auto Care'}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.garage_location || 'Dubai'}</p>
                      </div>
                      <div className="flex items-center text-[#feba02]">
                        <Star className="h-3.5 w-3.5 fill-current mr-1" />
                        <span className="font-bold text-gray-900">4.8</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Link 
            to="/search" 
            className="w-full text-center border border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer mt-6"
          >
            Search More Garages
          </Link>
        </div>

      </div>
    </div>
  );
}
