import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { fetchAnalytics } from '../../services/api';
import { TrendingUp, Users, Copy, Heart, Calendar } from 'lucide-react';

import { useAdmin } from '../../contexts/AdminContext';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

const Analytics = () => {
  const { analytics, loading } = useAdmin();

  if (loading || !analytics) return (
    <div className="flex items-center justify-center py-40">
      <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { 
    totalUsers, 
    totalPrompts, 
    totalLikes, 
    totalCopies, 
    dailyActivity, 
    categoryDistribution 
  } = analytics;

  return (
    <div className="space-y-8 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight text-gray-900">Advanced Analytics</h2>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold">Real-time</button>
          <button className="px-4 py-2 text-gray-400 rounded-xl text-xs font-bold hover:text-gray-900">Historical</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Platform Traffic</h3>
              <p className="text-sm text-gray-400 font-medium">Daily impressions and interactions (7 Days)</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-indigo-500" />
                 <span className="text-[10px] font-black uppercase text-gray-400">Views</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-purple-500" />
                 <span className="text-[10px] font-black uppercase text-gray-400">Copies</span>
               </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="copies" stroke="#a855f7" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Category Share</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
               {categoryDistribution?.map((c, i) => (
                 <div key={c.name} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                   <span className="text-[11px] font-bold text-gray-500">{c.name} ({c.value}%)</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white">
            <TrendingUp className="w-8 h-8 mb-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Total Copies</span>
            <h4 className="text-3xl font-bold mt-1">{totalCopies?.toLocaleString()}</h4>
            <p className="text-xs text-indigo-400 font-bold mt-4 flex items-center gap-1">
              Active engagement
            </p>
         </div>
         <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <Users className="w-8 h-8 mb-4 text-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Users</span>
            <h4 className="text-3xl font-bold mt-1 text-gray-900">{totalUsers?.toLocaleString()}</h4>
            <p className="text-xs text-green-400 font-bold mt-4 flex items-center gap-1">
              Live registrations
            </p>
         </div>
         <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <Heart className="w-8 h-8 mb-4 text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Likes</span>
            <h4 className="text-3xl font-bold mt-1 text-gray-900">{totalLikes?.toLocaleString()}</h4>
            <p className="text-xs text-red-400 font-bold mt-4 flex items-center gap-1">
              User appreciation
            </p>
         </div>
         <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <Calendar className="w-8 h-8 mb-4 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Prompts</span>
            <h4 className="text-3xl font-bold mt-1 text-gray-900">{totalPrompts?.toLocaleString()}</h4>
            <p className="text-xs text-blue-400 font-bold mt-4 flex items-center gap-1">
              Library volume
            </p>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
