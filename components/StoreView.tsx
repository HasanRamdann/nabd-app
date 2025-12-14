
import React, { useState } from 'react';
import { User, StoreItem } from '../types';
import * as Icons from './Icons';
import { formatNumber } from '../constants';

interface StoreViewProps {
  currentUser: User;
  onPurchase: (item: StoreItem) => void;
}

const STORE_ITEMS: StoreItem[] = [
  // --- Merchant Items (Clothes, Watches, Laptops) ---
  { id: 'item_shirt1', type: 'clothing', name: 'قميص فاخر', description: 'قميص قطني 100% تصميم إيطالي.', price: 150, icon: Icons.Shirt, color: 'bg-indigo-500' },
  { id: 'item_watch1', type: 'watch', name: 'ساعة كلاسيك', description: 'ساعة يد رجالية مقاومة للماء.', price: 450, icon: Icons.Watch, color: 'bg-stone-500' },
  { id: 'item_laptop1', type: 'electronics', name: 'لابتوب جيمنج', description: 'جهاز ألعاب قوي مع كرت شاشة RTX.', price: 3500, icon: Icons.Laptop, color: 'bg-red-600' },
  { id: 'item_monitor', type: 'electronics', name: 'شاشة 4K', description: 'شاشة بدقة عالية للأعمال والتصميم.', price: 1200, icon: Icons.Monitor, color: 'bg-blue-600' },
  { id: 'item_dress', type: 'clothing', name: 'فستان سهرة', description: 'فستان أنيق للحفلات والمناسبات.', price: 300, icon: Icons.Shirt, color: 'bg-pink-500' },

  // --- Features & Account ---
  { id: 'ver_blue', type: 'verification', name: 'الشارة الزرقاء', description: 'توثيق الحساب الرسمي وزيادة الثقة.', price: 5000, icon: Icons.ShieldCheck, color: 'bg-blue-500' },
  { id: 'ver_gold', type: 'verification', name: 'الشارة الذهبية', description: 'للمشاهير وصناع المحتوى النخبة.', price: 15000, icon: Icons.Crown, color: 'bg-yellow-500' },
  { id: 'boost_1', type: 'boost', name: 'دفعة سريعة', description: 'زيادة وصول منشورك القادم 2x.', price: 300, icon: Icons.Zap, color: 'bg-purple-500' },
  
  // --- Decoration ---
  { id: 'frame_neon', type: 'frame', name: 'إطار نيون', description: 'إطار مشع لصورتك الشخصية.', price: 800, icon: Icons.Circle, color: 'bg-pink-500' },
  { id: 'frame_gold', type: 'frame', name: 'إطار ذهبي', description: 'إطار ملكي فاخر.', price: 1200, icon: Icons.Circle, color: 'bg-yellow-600' },
];

const StoreView: React.FC<StoreViewProps> = ({ currentUser, onPurchase }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'inventory'>('market');
  const [filter, setFilter] = useState<'all' | 'clothing' | 'watch' | 'electronics' | 'verification' | 'frame'>('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const filteredItems = STORE_ITEMS.filter(i => {
        if (filter === 'all') return true;
        if (filter === 'electronics') return i.type === 'electronics';
        if (filter === 'clothing') return i.type === 'clothing';
        if (filter === 'watch') return i.type === 'watch';
        return i.type === filter;
    });

  const myItems = STORE_ITEMS.filter(i => currentUser.inventory?.includes(i.id) || (i.type === 'verification' && currentUser.isVerified));

  const handleBuyClick = (item: StoreItem) => {
    // Check ownership for non-consumables
    const isOwned = (['verification', 'frame'].includes(item.type) && currentUser.inventory?.includes(item.id)) ||
                    (item.type === 'verification' && currentUser.isVerified && 
                     ((item.id === 'ver_gold' && currentUser.verificationTier === 'gold') || (item.id === 'ver_blue' && currentUser.verificationTier === 'blue')));

    if (isOwned) {
        alert("أنت تمتلك هذا العنصر بالفعل!");
        return;
    }

    if (currentUser.coins < item.price) {
        alert("عذراً، رصيدك غير كافي لإتمام العملية!");
        return;
    }

    if (confirm(`هل أنت متأكد من شراء "${item.name}" مقابل ${item.price} عملة؟`)) {
        setPurchasingId(item.id);
        setTimeout(() => {
            onPurchase(item);
            setPurchasingId(null);
        }, 1500); // Simulate network
    }
  };

  return (
    <div className="pb-20 md:pb-0 animate-fadeIn space-y-6">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-8 shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                  <Icons.ShoppingBag className="text-yellow-400" size={32} />
                  سوق نبض
               </h1>
               <p className="text-indigo-200 text-sm max-w-md">
                  تسوق أحدث المنتجات، وثّق حسابك، واحصل على مميزات حصرية بعملاتك الرقمية!
               </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center min-w-[140px]">
               <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider">رصيدك الحالي</span>
               <div className="text-3xl font-black text-yellow-400 flex items-center gap-2 mt-1">
                  {formatNumber(currentUser.coins)} <Icons.Gem size={24} />
               </div>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'market' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
              تصفح المتجر
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
              ممتلكاتي ({myItems.length})
          </button>
      </div>

      {activeTab === 'market' && (
      <>
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
                { id: 'all', label: 'الكل', icon: Icons.Grid },
                { id: 'verification', label: 'شارات وتوثيق', icon: Icons.ShieldCheck },
                { id: 'clothing', label: 'ملابس', icon: Icons.Shirt },
                { id: 'watch', label: 'ساعات', icon: Icons.Watch },
                { id: 'electronics', label: 'الكترونيات', icon: Icons.Laptop },
                { id: 'frame', label: 'زينة', icon: Icons.Palette },
            ].map(cat => (
                <button
                key={cat.id}
                onClick={() => setFilter(filter === cat.id ? 'all' : cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${filter === cat.id ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 border-2 border-primary-500' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-2 border-transparent'}`}
                >
                <cat.icon size={16} />
                {cat.label}
                </button>
            ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
                const Icon = item.icon;
                // Logic for ownership
                const isOwned = (['verification', 'frame'].includes(item.type) && currentUser.inventory?.includes(item.id)) ||
                                (item.type === 'verification' && currentUser.isVerified && 
                                ((item.id === 'ver_gold' && currentUser.verificationTier === 'gold') || (item.id === 'ver_blue' && currentUser.verificationTier === 'blue')));
                
                const isAffordable = currentUser.coins >= item.price;
                
                return (
                <div key={item.id} className={`group bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 overflow-hidden relative flex flex-col ${isOwned ? 'border-green-500/50' : 'border-gray-100 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-xl'}`}>
                    {isOwned && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-sm">
                            <Icons.Check size={10} /> تم الامتلاك
                        </div>
                    )}
                    
                    <div className={`h-24 ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="px-6 relative -mt-12 flex-1 flex flex-col">
                        <div className={`w-20 h-20 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon size={36} />
                        </div>
                        
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                        
                        <div className="mt-auto pb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-lg font-bold flex items-center gap-1 ${isAffordable ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}>
                                    {formatNumber(item.price)} <Icons.Gem size={16} />
                                </span>
                                {!isAffordable && !isOwned && <span className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">رصيد غير كافي</span>}
                            </div>
                            
                            <button
                                onClick={() => handleBuyClick(item)}
                                disabled={purchasingId === item.id || isOwned || !isAffordable}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                    isOwned
                                    ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-default'
                                    : purchasingId === item.id 
                                    ? 'bg-primary-600 text-white opacity-80 cursor-wait'
                                    : !isAffordable
                                    ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 active:scale-95'
                                }`}
                            >
                                {purchasingId === item.id ? (
                                    <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span> جاري الشراء...</>
                                ) : isOwned ? (
                                    'مملوك'
                                ) : (
                                    <>شراء الآن <Icons.ShoppingBag size={18} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                );
            })}
        </div>
      </>
      )}

      {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myItems.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-gray-400">
                      <Icons.ShoppingBag size={64} className="mx-auto mb-4 opacity-30" />
                      <p>لم تقم بشراء أي شيء بعد.</p>
                  </div>
              ) : (
                  myItems.map(item => {
                      const Icon = item.icon;
                      const isActive = (item.type === 'frame' && currentUser.activeFrame === item.id) ||
                                     (item.type === 'verification' && currentUser.isVerified);
                      
                      return (
                        <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-xl ${item.color} text-white flex items-center justify-center`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {isActive ? 'مفعل' : 'في المخزون'}
                                </span>
                            </div>
                            {item.type === 'frame' && !isActive && (
                                <button 
                                    onClick={() => onPurchase(item)} // Reuse onPurchase to just activate frame
                                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-lg font-bold"
                                >
                                    تفعيل
                                </button>
                            )}
                        </div>
                      );
                  })
              )}
          </div>
      )}
    </div>
  );
};

export default StoreView;
