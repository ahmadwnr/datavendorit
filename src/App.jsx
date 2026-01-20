import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Globe, Mail, Building2, Server, Terminal, Shield, FileText, Lock, LogIn, LogOut, User, Loader2 } from 'lucide-react';

// --- KONFIGURASI ---
// GANTI URL INI DENGAN URL DARI GOOGLE APPS SCRIPT ANDA
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwL4UBH7OChybRc6LZit7uPy91Bn5h7HifsXFa2KEwhx9KxV9mAK1nBloG8Pnf6m10P/exec"; 

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true); // State loading awal
  const [isSubmitting, setIsSubmitting] = useState(false); // State loading saat submit
  
  // State Login & Modal
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // State Form Tambah Data
  const [newCompany, setNewCompany] = useState({
    name: "",
    services: "",
    description: "",
    location: "",
    website: "",
    email: "",
    companyProfileUrl: ""
  });

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // --- FETCH DATA DARI GOOGLE SHEET ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Jika URL masih placeholder, jangan fetch (atau gunakan mock data jika mau)
      if (GOOGLE_SCRIPT_URL.includes("CONTOH_URL")) {
         console.warn("URL Script belum diisi. Menggunakan data kosong.");
         setIsLoading(false);
         return;
      }

      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      
      // Format data dari Sheet (string services dipisah jadi array)
      const formattedData = data.map(item => ({
        ...item,
        services: item.services ? item.services.split(',').map(s => s.trim()) : [],
        // Pastikan ID ada, jika tidak generate random
        id: item.id || Math.random().toString(36).substr(2, 9)
      }));

      // Reverse agar data terbaru muncul di paling atas (opsional)
      setCompanies(formattedData.reverse());
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      alert("Gagal terhubung ke Database Google Sheet.");
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil fetch saat pertama kali load
  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIKA FILTER PENCARIAN ---
  const filteredCompanies = companies.filter((company) => {
    const term = searchTerm.toLowerCase();
    const services = Array.isArray(company.services) ? company.services : [];
    
    return (
      (company.name && company.name.toLowerCase().includes(term)) ||
      (company.description && company.description.toLowerCase().includes(term)) ||
      services.some(service => service.toLowerCase().includes(term))
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany({ ...newCompany, [name]: value });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleMainActionClick = () => {
    if (isLoggedIn) {
      setIsModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginData.username === 'admin' && loginData.password === 'admin') {
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      setLoginError('');
      setLoginData({ username: '', password: '' });
      setIsModalOpen(true);
    } else {
      setLoginError('Username atau password salah! (Coba: admin/admin)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // --- SUBMIT DATA KE GOOGLE SHEET ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Kirim data services sebagai string yang dipisah koma agar mudah disimpan di satu sel
    const payload = {
      ...newCompany,
      category: "General" 
    };

    try {
      // Menggunakan mode: 'no-cors' sering diperlukan untuk POST ke Google Script dari browser
      // Namun, fetch standar biasanya bekerja jika Script di-deploy sebagai "Anyone"
      // Kita gunakan fetch text/plain untuk menghindari CORS preflight yang rumit
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      // Setelah sukses submit, ambil ulang data terbaru
      await fetchData();

      setNewCompany({ name: "", services: "", description: "", location: "", website: "", email: "", companyProfileUrl: "" });
      setIsModalOpen(false);
      alert("Data berhasil disimpan ke Google Sheet!");
      
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (category) => {
    switch(category) {
      case 'Security': return <Shield className="w-6 h-6 text-red-500" />;
      case 'Development': return <Terminal className="w-6 h-6 text-green-500" />;
      case 'Consulting': return <Building2 className="w-6 h-6 text-blue-500" />;
      default: return <Server className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">IT Vendor Hub</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                  <User className="w-4 h-4" />
                  Admin
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-500 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}

            <button 
              onClick={handleMainActionClick}
              className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${isLoggedIn ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 hover:bg-slate-800'}`}
            >
              {isLoggedIn ? <Plus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isLoggedIn ? "Tambah Vendor" : "Login Admin"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Temukan Partner IT Terbaik</h2>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
            Database terintegrasi dengan Google Sheets secara Real-time.
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg placeholder-slate-400 transition-all"
              placeholder="Coba cari 'Cyber Security' atau 'Consulting'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-700">
            {searchTerm ? `Hasil pencarian: "${searchTerm}"` : "Semua Vendor Terdaftar"}
          </h3>
          <span className="text-sm bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
            {filteredCompanies.length} Perusahaan
          </span>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
            <p>Mengambil data dari Google Sheet...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow p-6 flex flex-col">
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

                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(company.services) && company.services.slice(0, 3).map((service, idx) => (
                    <span 
                      key={idx} 
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full 
                        ${searchTerm && service.toLowerCase().includes(searchTerm.toLowerCase()) 
                          ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-400' 
                          : 'bg-indigo-50 text-indigo-700'}`}
                    >
                      {service}
                    </span>
                  ))}
                   {Array.isArray(company.services) && company.services.length > 3 && (
                    <span className="text-xs text-slate-400 px-1 py-0.5">+{company.services.length - 3}</span>
                  )}
                </div>

                <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3">
                  {company.description}
                </p>

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
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="mx-auto h-12 w-12 text-slate-300 mb-3">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada perusahaan ditemukan</h3>
            {GOOGLE_SCRIPT_URL.includes("CONTOH_URL") && (
               <p className="mt-2 text-red-500 font-bold">⚠️ Mohon masukkan URL Google Script Anda di kode.</p>
            )}
          </div>
        )}
      </main>

      {/* Modal LOGIN ADMIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 relative overflow-hidden">
             {/* Hiasan background login */}
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50"></div>
            
            <div className="text-center mb-6 relative">
              <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3 text-indigo-600">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Login Admin</h3>
              <p className="text-sm text-slate-500">Masuk untuk mengelola data vendor.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  name="username"
                  value={loginData.username} 
                  onChange={handleLoginChange}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={loginData.password} 
                  onChange={handleLoginChange}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
                  placeholder="admin"
                />
              </div>

              {loginError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100 text-center">
                  {loginError}
                </div>
              )}

              <button type="submit" className="w-full py-2.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 font-medium shadow-md hover:shadow-lg transition-all transform active:scale-95">
                Masuk Dashboard
              </button>
            </form>

            <button 
              onClick={() => setIsLoginModalOpen(false)} 
              className="mt-4 w-full text-center text-sm text-slate-400 hover:text-slate-600"
            >
              Batal / Kembali
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah Data (Hanya untuk Admin) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Tambah Company Profile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Pesan Info Admin */}
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 mb-4">
                <User className="w-4 h-4" />
                <span>Login sebagai <strong>Admin</strong></span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Perusahaan</label>
                <input required name="name" value={newCompany.name} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="PT Teknologi Maju..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Layanan (Pisahkan dengan koma)</label>
                <input required name="services" value={newCompany.services} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="IT Consulting, Web Dev, Networking..." />
                <p className="text-xs text-slate-500 mt-1">Contoh: Web Development, Data Analytics</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea required name="description" value={newCompany.description} onChange={handleInputChange} rows={3} className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Jelaskan keahlian utama perusahaan..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
                  <input required name="location" value={newCompany.location} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500" placeholder="Jakarta..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input required type="email" name="email" value={newCompany.email} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500" placeholder="info@company.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <input name="website" value={newCompany.website} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500" placeholder="www.company.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link Company Profile (PDF/Drive)</label>
                <input name="companyProfileUrl" value={newCompany.companyProfileUrl} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500" placeholder="https://drive.google.com/..." />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">Batal</button>
                <button disabled={isSubmitting} type="submit" className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 font-medium shadow-sm disabled:bg-indigo-300 flex justify-center items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}