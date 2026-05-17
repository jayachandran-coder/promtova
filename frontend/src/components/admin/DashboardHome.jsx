import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Image as ImageIcon, 
  Heart, 
  Copy, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const StatsCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {Math.abs(trend)}%
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-gray-400 text-sm font-medium mb-1">{title}</span>
      <span className="text-3xl font-bold text-gray-900 tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const { analytics: stats, loading } = useAdmin();

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-40 bg-gray-100 rounded-[2.5rem] animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-10 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Prompts" 
          value={stats?.totalPrompts || 0} 
          icon={ImageIcon} 
          trend={12} 
          color="bg-blue-500" 
        />
        <StatsCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          trend={8} 
          color="bg-purple-500" 
        />
        <StatsCard 
          title="Total Copies" 
          value={stats?.totalCopies || 0} 
          icon={Copy} 
          trend={15} 
          color="bg-orange-500" 
        />
        <StatsCard 
          title="Total Likes" 
          value={stats?.totalLikes || 0} 
          icon={Heart} 
          trend={-3} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">Activity Overview</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold">Week</button>
              <button className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100">Month</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-2">
             {/* Simple Custom Bar Chart Mockup with real trend info */}
             {[40, 65, 45, 90, 55, 75, 50].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                 <div className="w-full relative">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="w-full bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors relative"
                    >
                       <div className="absolute top-0 left-0 w-full h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                 </div>
                 <span className="text-xs font-bold text-gray-400">Day {i+1}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Trending Category</h3>
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
               <TrendingUp className="w-8 h-8 mb-4" />
               <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Most Popular</span>
               <h4 className="text-3xl font-black mt-1">{stats?.trendingCategory || 'Architecture'}</h4>
            </div>
            
            <div className="space-y-4">
              {stats?.topCategories?.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-500">{cat.name}</span>
                    <span className="font-black text-gray-900">{cat.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      className={`h-full rounded-full ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-purple-500' : 'bg-pink-500'}`} 
                    />
                  </div>
                </div>
              ))}
              {!stats?.topCategories?.length && (
                <p className="text-gray-400 text-xs font-medium text-center py-4">No engagement data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
