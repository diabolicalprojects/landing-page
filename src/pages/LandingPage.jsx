import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Common components
import GEOTags from '../components/common/GEOTags';
import CustomCursor from '../components/common/CustomCursor';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import DiabolicalChatbot from '../components/common/DiabolicalChatbot';

// Section components
import Hero from '../components/sections/Hero';
import Problem from '../components/sections/Problem';
import SolutionCards from '../components/sections/SolutionCards';
import ComparisonSection from '../components/sections/ComparisonSection';
import BoldHook from '../components/sections/BoldHook';
import SuccessStories from '../components/sections/SuccessStories';
import FAQSection from '../components/sections/FAQSection';
import Contact from '../components/sections/Contact';

const LandingPage = () => {
    const [seoData, setSeoData] = useState({
        title: "Diabolical | IA Services & Elite Design",
        description: "Consultoría de Ingeniería en Sistemas Autónomos.",
        keywords: ""
    });

    useEffect(() => {
        const loadSEO = async () => {
            try {
                const res = await axios.get('/api/settings');
                setSeoData(res.data);
            } catch (error) {
                console.warn("Using default SEO data");
            }
        };
        loadSEO();
    }, []);

    return (
        <main className="relative bg-black min-h-screen selection:bg-white selection:text-black font-jakarta overflow-x-hidden">
            <GEOTags data={seoData} />
            <CustomCursor />
            {/* Soft Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[150px] rounded-full" />
            </div>

            <Navbar />
            <Hero />
            <Problem />
            <SolutionCards />
            <SuccessStories />
            <ComparisonSection />
            <BoldHook />
            <FAQSection />
            <Contact />
            <Footer />
            <DiabolicalChatbot />
        </main>
    );
};

export default LandingPage;
