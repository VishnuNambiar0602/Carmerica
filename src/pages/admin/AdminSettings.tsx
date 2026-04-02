import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Globe, Database, Mail, Lock, Eye, EyeOff, Save, Trash2, Check, X, Info, CreditCard, Smartphone, Monitor, User, Server } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = React.useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'localization', name: 'Localization', icon: Globe },
    { id: 'database', name: 'Database', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500">Configure platform-wide settings, security protocols, and system preferences.</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center shadow-lg shadow-red-100 transition-all">
          <Save className="h-4 w-4 mr-2" /> Save All Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <nav className="flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center px-6 py-4 text-sm font-bold border-l-4 transition-all",
                    activeTab === tab.id 
                      ? "bg-red-50 border-red-600 text-red-600" 
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <tab.icon className={cn("h-5 w-5 mr-3", activeTab === tab.id ? "text-red-600" : "text-gray-400")} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-grow space-y-6">
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">General Configuration</h2>
                <p className="text-sm text-gray-500">Basic platform identity and operational settings.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Platform Name</label>
                    <input type="text" defaultValue="CarServ" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Support Email</label>
                    <input type="email" defaultValue="support@carserv.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Platform URL</label>
                    <input type="text" defaultValue="https://carserv.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Maintenance Mode</label>
                    <div className="flex items-center h-10">
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                      </button>
                      <span className="ml-3 text-sm text-gray-500">Disabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Security Protocols</h2>
                <p className="text-sm text-gray-500">Manage authentication, encryption, and access control.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Smartphone className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Two-Factor Authentication (2FA)</p>
                        <p className="text-xs text-gray-500">Require MFA for all administrative accounts.</p>
                      </div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Monitor className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Session Timeout</p>
                        <p className="text-xs text-gray-500">Automatically log out inactive users after 30 minutes.</p>
                      </div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-1">System Audit Log</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                All changes to system settings are logged and attributed to the administrator who performed them. 
                View the <span className="font-bold underline cursor-pointer">Audit Logs</span> for more details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
