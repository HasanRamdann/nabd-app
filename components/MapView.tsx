
import React, { useState } from 'react';
import { Post, User } from '../types';
import * as Icons from './Icons';

interface MapPin {
    id: string;
    lat: number;
    lng: number;
    type: 'event' | 'trend' | 'place';
    title: string;
    image?: string;
}

const MOCK_PINS: MapPin[] = [
    { id: '1', lat: 30, lng: 40, type: 'trend', title: 'مهرجان القهوة', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&fit=crop' },
    { id: '2', lat: 60, lng: 70, type: 'event', title: 'حفل غنائي', image: 'https://images.unsplash.com/photo-1459749411177-3c925d68d463?w=400&fit=crop' },
    { id: '3', lat: 45, lng: 20, type: 'place', title: 'تجمع المصممين', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&fit=crop' },
    { id: '4', lat: 75, lng: 50, type: 'trend', title: 'مسابقة تصوير', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&fit=crop' },
];

const MapView: React.FC = () => {
    const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

    return (
        <div className="w-full h-[calc(100vh-160px)] md:h-[calc(100vh-100px)] relative bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-inner border border-gray-200 dark:border-slate-700 animate-fadeIn">
            {/* Mock Map Background */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale"></div>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg pointer-events-auto max-w-xs">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Icons.MapPin className="text-red-500" /> خريطة نبض
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">اكتشف الأحداث والتريندات في منطقتك الجغرافية.</p>
                </div>
                <button className="bg-white dark:bg-slate-900 p-3 rounded-full shadow-lg pointer-events-auto hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <Icons.Target className="text-blue-500" />
                </button>
            </div>

            {/* Pins */}
            {MOCK_PINS.map((pin) => (
                <button
                    key={pin.id}
                    onClick={() => setSelectedPin(selectedPin?.id === pin.id ? null : pin)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform group"
                    style={{ top: `${pin.lat}%`, left: `${pin.lng}%` }}
                >
                    <div className="relative">
                        <div className={`w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 shadow-xl overflow-hidden ${selectedPin?.id === pin.id ? 'ring-4 ring-primary-500' : ''}`}>
                            <img src={pin.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center text-[8px] text-white ${
                            pin.type === 'event' ? 'bg-purple-500' : pin.type === 'trend' ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                            {pin.type === 'event' ? <Icons.Calendar size={8} /> : pin.type === 'trend' ? <Icons.Flame size={8} /> : <Icons.MapPin size={8} />}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {pin.title}
                        </div>
                    </div>
                </button>
            ))}

            {/* Selected Pin Card */}
            {selectedPin && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl animate-slideUp z-20 border border-gray-100 dark:border-slate-700">
                    <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                        <img src={selectedPin.image} className="w-full h-full object-cover" alt="" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedPin(null); }}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                        >
                            <Icons.X size={16} />
                        </button>
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white mb-1 inline-block ${
                                selectedPin.type === 'event' ? 'bg-purple-500' : selectedPin.type === 'trend' ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                                {selectedPin.type === 'event' ? 'فعالية' : selectedPin.type === 'trend' ? 'تريند' : 'مكان'}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedPin.title}</h3>
                            <p className="text-xs text-gray-500">يبعد 1.2 كم عن موقعك</p>
                        </div>
                        <button className="bg-primary-600 text-white p-2 rounded-xl shadow-lg hover:bg-primary-700">
                            <Icons.ArrowLeft className="rtl:rotate-180" size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapView;
