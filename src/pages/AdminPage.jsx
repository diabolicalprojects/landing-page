import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Zap, Search, Share2, Terminal as TerminalIcon, Activity } from 'lucide-react';
import { cn } from '../utils/cn';
import logoCuadradoBlanco from '../assets/logo/LOGO-DIABOLICAL-CUADRADO-BLANCO.svg';

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seo');
    const [formData, setFormData] = useState({
        // SEO Básica
        title: "DIABOLICAL | Elite AI Automation & Design",
        description: "Exponential scaling through autonomous AI systems and high-end digital engineering.",
        keywords: "AI Automation, Elite Design, Business Intelligence, Digital Engineering",
        siteUrl: "https://diabolicalservices.tech",

        // Social & Brand
        favicon: "/favicon.ico",
        ogImage: "",
        twitterHandle: "@diabolical",

        // Advanced Técnico
        sitemapXml: "",
        robotsTxt: "User-agent: *\nAllow: /",
        structuredData: "{}",

        // Analytics & Tracking
        googleTagManager: "",
        metaPixel: "",
        customHeaderScripts: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (formData.title) document.title = formData.title;
    }, [formData.title]);

    useEffect(() => {
        document.body.classList.add('admin-mode');
        return () => document.body.classList.remove('admin-mode');
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/settings');
                if (res.data) setFormData({ ...formData, ...res.data });
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === "admin" && password === "Diabolical1502") {
            setIsLoggedIn(true);
        } else {
            alert("ACCESO DENEGADO: Identidad o Protocolo Inválido");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axios.post('/api/settings', formData);
            alert('INFRAESTRUCTURA ACTUALIZADA: La información se ha propagado a los motores de búsqueda.');
        } catch (error) {
            console.error("Error updating SEO:", error);
            alert('Error al sincronizar con el centro de mando.');
        } finally {
            setIsSaving(false);
        }
    };

    const getSEOScore = () => {
        let score = 0;
        if (formData.title.length > 30 && formData.title.length < 60) score += 25;
        if (formData.description.length > 120 && formData.description.length < 160) score += 25;
        if (formData.ogImage) score += 25;
        if (formData.googleTagManager || formData.metaPixel) score += 25;
        return score;
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-5 font-jakarta relative overflow-hidden">
                <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-md border-white/10 text-center relative z-10">
                    <img src={logoCuadradoBlanco} width="96" height="96" className="w-24 mx-auto mb-10 opacity-80" alt="Diabolical" />
                    <div className="space-y-2 mb-10">
                        <h2 className="text-2xl font-title tracking-[0.2em] uppercase text-white">Admin_Access</h2>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">Secure Infrastructure Node</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-3">
                            <input type="text" placeholder="USERNAME" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center text-white focus:outline-none focus:border-white/30 font-mono text-sm tracking-widest transition-all min-h-[52px]" value={username} onChange={(e) => setUsername(e.target.value)} />
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="AUTH_TOKEN" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center text-white focus:outline-none focus:border-white/30 font-mono text-sm tracking-widest transition-all min-h-[52px]" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 p-2 transition-colors">
                                    {showPassword ? <Lock size={16} /> : <Zap size={16} />}
                                </button>
                            </div>
                        </div>
                        <button className="w-full py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.5em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl mt-4">UNLOCK_TERMINAL</button>
                    </form>
                </div>
            </div>
        );
    }

    const score = getSEOScore();

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-jakarta">

            {/* Header Dashboard */}
            <header className="px-4 md:px-8 py-4 md:py-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-4 md:gap-6">
                    <img src={logoCuadradoBlanco} alt="" width="32" height="32" className="w-7 md:w-8" />
                    <div className="h-6 w-px bg-white/10" />
                    <div>
                        <h1 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] flex items-center gap-2">
                            Monster_SEO <span className="text-[8px] bg-red-500/80 text-white px-2 py-0.5 rounded-full animate-pulse">Live</span>
                        </h1>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">Infrastructure Control Center</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", score > 70 ? "bg-green-500" : "bg-yellow-500")} />
                        <span className="text-[8px] md:text-[9px] font-mono text-white/40 uppercase tracking-widest">SEO: {score}%</span>
                    </div>
                    <button onClick={() => navigate('/')} className="px-4 md:px-6 py-2 glass rounded-full text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all whitespace-nowrap">Exit_Node</button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-20 md:w-64 border-r border-white/5 bg-black flex flex-col p-4 gap-2">
                    {[
                        { id: 'seo', icon: <Search size={18} />, label: 'SEO Core' },
                        { id: 'social', icon: <Share2 size={18} />, label: 'Social & Branding' },
                        { id: 'tech', icon: <TerminalIcon size={18} />, label: 'Technical XML/IA' },
                        { id: 'analytics', icon: <Activity size={18} />, label: 'Tracking Tags' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl transition-all group",
                                activeTab === tab.id ? "bg-white text-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <span className="group-hover:scale-110 transition-transform">{tab.icon}</span>
                            <span className="hidden md:block text-[10px] uppercase font-black tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto p-4 md:p-6 bg-white/[0.02] rounded-3xl border border-white/5 hidden md:block">
                        <h4 className="text-[8px] uppercase tracking-widest text-white/20 mb-2">Build_Status</h4>
                        <div className="flex justify-between items-center text-[9px] font-mono text-green-500/60 uppercase">
                            <span>Sitemap</span>
                            <span>Valid</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Areas */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 lg:p-16">
                    <form onSubmit={handleSubmit} className="max-w-4xl space-y-12">

                        {activeTab === 'seo' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic level-label">Main Search Title</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30 transition-all text-xl" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic level-label">Meta Description (Max 160)</label>
                                    <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30 transition-all resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic level-label">Canonical Site URL</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white/50 focus:outline-none focus:border-white/30 transition-all font-mono" value={formData.siteUrl} onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Social Preview Image (OG Image URL)</label>
                                    <input type="text" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30 transition-all font-mono" value={formData.ogImage} onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Favicon Path</label>
                                    <input type="text" placeholder="/favicon.ico" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30 transition-all font-mono" value={formData.favicon} onChange={(e) => setFormData({ ...formData, favicon: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'tech' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Structured Data (Scheme JSON)</label>
                                    <textarea rows="6" className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white/50 focus:outline-none focus:border-white/30 transition-all font-mono text-xs" value={formData.structuredData} onChange={(e) => setFormData({ ...formData, structuredData: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Sitemap.xml Config</label>
                                    <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white/50 focus:outline-none focus:border-white/30 transition-all font-mono text-xs" value={formData.sitemapXml} onChange={(e) => setFormData({ ...formData, sitemapXml: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold">Google Tag Manager (ID)</label>
                                        <input type="text" placeholder="GTM-XXXXXX" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30" value={formData.googleTagManager} onChange={(e) => setFormData({ ...formData, googleTagManager: e.target.value })} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold">Meta Pixel (ID)</label>
                                        <input type="text" placeholder="1234567890" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30" value={formData.metaPixel} onChange={(e) => setFormData({ ...formData, metaPixel: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Head Injection Scripts</label>
                                    <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white/30 focus:outline-none focus:border-white/30 transition-all font-mono text-[10px]" value={formData.customHeaderScripts} onChange={(e) => setFormData({ ...formData, customHeaderScripts: e.target.value })} />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSaving}
                            className={cn(
                                "fixed bottom-5 right-4 md:bottom-12 md:right-12 px-8 md:px-12 py-4 md:py-6 rounded-full font-black text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all z-50",
                                isSaving ? "bg-white/20 text-white/40" : "bg-white text-black hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                            )}
                        >
                            {isSaving ? "SYNCHRONIZING..." : "PROPAGATE_ALL_DATA"}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default AdminPage;
