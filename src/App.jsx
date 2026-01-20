import React, { useState, useEffect } from 'react';
import { Search, MapPin, Globe, Mail, Building2, Server, Terminal, Shield, FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

// --- KONFIGURASI ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwL4UBH7OChybRc6LZit7uPy91Bn5h7HifsXFa2KEwhx9KxV9mAK1nBloG8Pnf6m10P/exec"; 

// --- SUB-COMPONENT: KARTU PERUSAHAAN ---
const CompanyCard = ({ company, searchTerm, getIcon }) => {
  const [expandServices, setExpandServices] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);

  const services = Array.isArray(company.services) ? company.services : [];

  // --- LOGIKA PRIORITAS SERVICE (FITUR BARU) ---
  // Membuat salinan array services untuk dimanipulasi tampilannya
  let sortedServices = [...services];

  // Jika ada kata kunci pencarian, urutkan services
  if (searchTerm) {
    sortedServices.sort((a, b) => {
      const term = searchTerm.toLowerCase();
      const aMatch = a.toLowerCase().includes(term);
      const bMatch = b.toLowerCase().includes(term);

      // Logika sort: 
      // Jika A cocok dan B tidak, A naik ke depan (-1)
      // Jika B cocok dan A tidak, B naik ke depan (1)
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0; // Jika keduanya cocok atau tidak, biarkan urutannya
    });
  }

  // Menentukan mana yang ditampilkan berdasarkan status expand
  const visibleServices = expandServices ? sortedServices : sortedServices.slice(0, 3);
  const hasMoreServices = services.length > 3;
  
  const isLongDesc = company.description && company.description.length > 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            {getIcon(company.category || 'General')}
          </div>
          <div>
            <h4 className="font-bold text-lg text-slate-900 leading-tight">{company.name}</h4>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin className="w-3 h-3" />
              {company.location}
            </div>
          </div>
        </div>
      </div>

      {/* --- BAGIAN SERVICES --- */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {visibleServices.map((service, idx) => {
            // Cek apakah service ini cocok dengan pencarian untuk styling highlight
            const isMatch = searchTerm && service.toLowerCase().includes(searchTerm.toLowerCase());
            
            return (
              <span 
                key={idx} 
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border transition-colors duration-300
                  ${isMatch
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200 ring-1 ring-yellow-300 shadow-sm' // Highlight lebih kuat
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}
              >
                {service}
              </span>
            );
          })}
          
          {/* Tombol More untuk Services */}
          {hasMoreServices && !expandServices && (
            <button 
              onClick={() => setExpandServices(true)}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              +{services.length - 3} lainnya
            </button>
          )}
        </div>
        
        {/* Tombol Collapse Services */}
        {expandServices && hasMoreServices && (
          <button 
            onClick={() => setExpandServices(false)}
            className="text-xs text-slate-400 hover:text-indigo-600 mt-2 flex items-center gap-1"
          >
            <ChevronUp className="w-3 h-3" /> Sembunyikan layanan
          </button>
        )}
      </div>

      {/* --- BAGIAN DESKRIPSI --- */}
      <div className="mb-6 flex-grow">
        <p className={`text-slate-600 text-sm transition-all duration-300 ${expandDesc ? '' : 'line-clamp-3'}`}>
          {company.description}
        </p>
        
        {/* Tombol More untuk Deskripsi */}
        {isLongDesc && (
          <button 
            onClick={() => setExpandDesc(!expandDesc)}
            className="text-indigo-600 text-xs mt-1 font-medium hover:underline focus:outline-none flex items-center gap-1"
          >
            {expandDesc ? (
              <>Sembunyikan <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Baca selengkapnya <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-3">
          {company.website && (
            <a href={`http://${company.website.replace('http://','').replace('https://','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Web</span>
            </a>
          )}
          {company.companyProfileUrl && (
            <a href={company.companyProfileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600" title="Lihat Company Profile">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Profil</span>
            </a>
          )}
        </div>
        {company.email && (
          <a href={`mailto:${company.email}`} className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800">
            <Mail className="w-4 h-4" />
            Hubungi
          </a>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT UTAMA ---
export default function App() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (GOOGLE_SCRIPT_URL.includes("CONTOH_URL")) {
         console.warn("URL Script belum diisi.");
         setIsLoading(false);
         return;
      }

      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      
      const formattedData = data.map(item => ({
        ...item,
        services: item.services ? item.services.split(',').map(s => s.trim()) : [],
        id: item.id || Math.random().toString(36).substr(2, 9)
      }));

      setCompanies(formattedData.reverse());
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCompanies = companies.filter((company) => {
    const term = searchTerm.toLowerCase();
    const services = Array.isArray(company.services) ? company.services : [];
    
    return (
      (company.name && company.name.toLowerCase().includes(term)) ||
      (company.description && company.description.toLowerCase().includes(term)) ||
      services.some(service => service.toLowerCase().includes(term))
    );
  });

  const getIcon = (category) => {
    switch(category) {
      case 'Security': return <Shield className="w-6 h-6 text-red-500" />;
      case 'Development': return <Terminal className="w-6 h-6 text-green-500" />;
      case 'Consulting': return <Building2 className="w-6 h-6 text-blue-500" />;
      default: return <Server className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">IT Vendor Hub</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Temukan Partner IT Terbaik</h2>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
            Database Vendor IT Terlengkap & Terintegrasi.
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg placeholder-slate-400 transition-all"
              placeholder="Cari layanan (misal: Cyber Security) atau nama PT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-700">
            {searchTerm ? `Hasil pencarian: "${searchTerm}"` : "Daftar Vendor"}
          </h3>
          <span className="text-sm bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
            {filteredCompanies.length} Perusahaan
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
            <p>Memuat data vendor...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredCompanies.map((company) => (
              <CompanyCard 
                key={company.id} 
                company={company} 
                searchTerm={searchTerm} 
                getIcon={getIcon} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="mx-auto h-12 w-12 text-slate-300 mb-3">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada perusahaan ditemukan</h3>
          </div>
        )}
      </main>
    </div>
  );
}
