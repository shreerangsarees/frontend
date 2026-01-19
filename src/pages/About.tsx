import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';

// --- Reusable Component for Animated Sections ---
const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
    return <div className="fade-in">{children}</div>;
};

// --- Reusable SVG Icons ---
const GemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M12 22V9" /><path d="m3.5 8.5 17 0" /></svg>
);
const PaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><path d="M22 10.5c0 .5-.5 1-1 1-.5 0-1-.5-1-1 0-.5.5-1 1-1 .5 0 1 .5 1 1z" /><path d="M20.56 14.44a10 10 0 0 0-10-10C5.56 4.44.5 9.5 0 14.5c-.5 5.5 4.06 10 9.44 10 5.5 0 10-4.5 10-10 .06-.5-.44-1-.94-1z" /></svg>
);
const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" /></svg>
);
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);
const QuoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.2"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
);

// --- Decorative Divider ---
const DecorativeDivider = () => (
    <div className="flex items-center justify-center my-12 md:my-16">
        <div className="h-px flex-1 bg-gradient-to-l from-amber-400 to-transparent"></div>
        <div className="text-amber-500"><GemIcon /></div>
        <div className="h-px flex-1 bg-gradient-to-r from-amber-400 to-transparent"></div>
    </div>
);

// --- Stats Counter Component ---
const StatCounter = ({ end, label, suffix = "+" }: { end: number, label: string, suffix?: string }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (!hasAnimated) return;

        const duration = 2000;
        const steps = 60;
        const increment = end / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [end, hasAnimated]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            });
        }, { threshold: 0.5 });

        const element = document.getElementById(`stat-${label}`);
        if (element) observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [label, hasAnimated]);

    return (
        <div id={`stat-${label}`} className="text-center p-3 sm:p-4 md:p-6">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-animated mb-1 sm:mb-2">
                {count}{suffix}
            </div>
            <div className="text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg">{label}</div>
        </div>
    );
};

// --- Testimonial Card ---
const TestimonialCard = ({ name, review, rating }: { name: string, review: string, rating: number }) => (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <div className="text-amber-500 mb-3 sm:mb-4"><QuoteIcon /></div>
        <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed italic text-sm sm:text-base">"{review}"</p>
        <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-800 text-sm sm:text-base">{name}</div>
            <div className="flex gap-1">
                {[...Array(rating)].map((_, i) => (
                    <div key={i} className="text-amber-500"><StarIcon /></div>
                ))}
            </div>
        </div>
    </div>
);

// --- Main About Component ---
const About = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.fade-in');
        elements.forEach((el) => observer.observe(el));

        return () => elements.forEach((el) => observer.unobserve(el));
    }, []);

    return (
        <Layout>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        .ken-burns {
          animation: kenburns 20s ease-out infinite;
        }
        @keyframes kenburns {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.15) translate(-2%, 2%); }
          100% { transform: scale(1.05) translate(0, 0); }
        }

        .fade-in {
          opacity: 0;
          transform: translateY(30px) scale(0.98);
          transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .fade-in-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .text-gradient-animated {
          background: linear-gradient(45deg, #8D152F, #D4AF37, #8D152F);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          animation: backgroundPan 8s linear infinite;
        }
        @keyframes backgroundPan {
          from { background-position: 200% center; }
          to { background-position: 0% center; }
        }

        .parallax-bg {
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
        }
      `}</style>

            <div className="bg-gradient-to-b from-[#FDFBF8] to-[#FFF8F5] font-sans text-slate-800">

                {/* --- Hero Section --- */}
                <div className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
                    <div className="absolute inset-0">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat ken-burns"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/p/AF1QipPQQOo3iJppY4a-nvyqkvZkPIMp6VaEvOh4pANa=s680-w680-h510')" }}
                        ></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30"></div>
                    <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif mb-3 sm:mb-4 tracking-wider animate-fade-in" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.6)' }}>
                            A Tapestry of Tradition
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl font-light text-slate-200 mb-6 sm:mb-8 px-2">
                            Embrace elegance with vibrant designs and premium quality, celebrating heritage and beauty in every graceful drape.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm sm:text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
                        >
                            Explore Our Collection
                        </button>
                    </div>
                </div>

                <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">

                    {/* --- Stats Section --- */}
                    <AnimatedSection>
                        <section className="container mx-auto max-w-7xl">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
                                <StatCounter end={25} label="Years of Excellence" />
                                <StatCounter end={5000} label="Happy Customers" />
                                <StatCounter end={500} label="Unique Designs" />
                                <StatCounter end={100} label="Quality Guarantee" suffix="%" />
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection><DecorativeDivider /></AnimatedSection>

                    {/* --- Owner Section --- */}
                    <AnimatedSection>
                        <section className="container mx-auto mt-8 max-w-7xl">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                                <div className="order-2 lg:order-1">
                                    <div className="relative group max-w-md mx-auto lg:max-w-none">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-rose-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                        <div className="relative p-2 bg-white rounded-lg shadow-2xl overflow-hidden">
                                            <img
                                                src="/sanjay.jpg"
                                                alt="Mr. Sanjay Rogye, Owner of Shreerang Saree"
                                                className="rounded-md object-cover w-full h-[350px] sm:h-[400px] md:h-[450px] transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="order-1 lg:order-2">
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-animated mb-3 sm:mb-4">A Visionary's Passion</h2>
                                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-4 sm:mb-6">Meet the Founder: Mr. Sanjay Rogye</h3>
                                    <p className="text-slate-600 mb-3 sm:mb-4 leading-relaxed text-base sm:text-lg">
                                        Mr. Sanjay Rogye, the proud owner of Shreerang Saree, is dedicated to bringing the timeless elegance of traditional sarees to the modern world.
                                    </p>
                                    <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-4 sm:mb-6">
                                        With a deep-rooted passion for preserving India's rich cultural heritage, he meticulously curates the finest handcrafted sarees. His commitment ensures that every piece is not just a garment, but a masterpiece of exceptional quality and enduring craftsmanship.
                                    </p>
                                    <div className="flex flex-wrap gap-3 sm:gap-4">
                                        <div className="px-3 sm:px-5 py-2 sm:py-3 bg-rose-50 rounded-full text-rose-700 text-sm sm:text-base font-medium">Authentic Designs</div>
                                        <div className="px-3 sm:px-5 py-2 sm:py-3 bg-amber-50 rounded-full text-amber-700 text-sm sm:text-base font-medium">Premium Quality</div>
                                        <div className="px-3 sm:px-5 py-2 sm:py-3 bg-sky-50 rounded-full text-sky-700 text-sm sm:text-base font-medium">Expert Curation</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection><DecorativeDivider /></AnimatedSection>

                    {/* --- What We Offer Section --- */}
                    <AnimatedSection>
                        <section className="container mx-auto text-center mt-8 max-w-7xl">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-animated mb-3 sm:mb-4">Our Promise of Excellence</h2>
                            <p className="text-slate-600 text-base sm:text-lg mb-12 sm:mb-16 max-w-2xl mx-auto px-4">
                                Every saree tells a story. We bring you the finest collection with unmatched service.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                                <div className="group p-6 sm:p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover-glow">
                                    <div className="p-3 sm:p-4 bg-gradient-to-br from-rose-100 to-rose-50 rounded-full mb-4 sm:mb-6 text-[#8D152F] inline-block group-hover:scale-110 transition-transform duration-300">
                                        <PaletteIcon />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Exquisite Designs</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">A curated collection blending timeless tradition with contemporary elegance for every occasion.</p>
                                </div>
                                <div className="group p-6 sm:p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover-glow">
                                    <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full mb-4 sm:mb-6 text-amber-600 inline-block group-hover:scale-110 transition-transform duration-300">
                                        <GemIcon />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Unmatched Quality</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">Only the finest fabrics and most intricate craftsmanship in every single saree we offer.</p>
                                </div>
                                <div className="group p-6 sm:p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover-glow">
                                    <div className="p-3 sm:p-4 bg-gradient-to-br from-sky-100 to-sky-50 rounded-full mb-4 sm:mb-6 text-sky-600 inline-block group-hover:scale-110 transition-transform duration-300">
                                        <ShoppingCartIcon />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Personalized Service</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">An unforgettable shopping experience with our dedicated and knowledgeable team.</p>
                                </div>
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection><DecorativeDivider /></AnimatedSection>

                    {/* --- Shop Gallery Section --- */}
                    <AnimatedSection>
                        <section className="container mx-auto text-center mt-8 max-w-7xl">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-animated mb-3 sm:mb-4">A Glimpse of Shreerang</h2>
                            <p className="text-slate-600 text-base sm:text-lg mb-12 sm:mb-16 max-w-2xl mx-auto px-4">
                                Step into our world where tradition meets elegance in every corner.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="h-64 sm:h-72 rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <img src="https://shreerangsaree.netlify.app/images/shop.jpeg?text=Rich+Saree+Collection" alt="A wide collection of vibrant sarees on display" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div className="h-64 sm:h-72 rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <img src="https://shreerangsaree.netlify.app/images/shop.jpeg?text=Store+Interior" alt="The elegant interior of the Shreerang Saree store" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div className="h-64 sm:h-72 rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <img src="https://shreerangsaree.netlify.app/images/shop.jpeg?text=Happy+Customer+Interaction" alt="A happy customer being assisted by staff" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection><DecorativeDivider /></AnimatedSection>

                    {/* --- Testimonials Section --- */}
                    <AnimatedSection>
                        <section className="container mx-auto text-center mt-8 max-w-7xl">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-animated mb-3 sm:mb-4">What Our Customers Say</h2>
                            <p className="text-slate-600 text-base sm:text-lg mb-12 sm:mb-16 max-w-2xl mx-auto px-4">
                                Don't just take our word for it - hear from our delighted customers.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                <TestimonialCard
                                    name="Priya Sharma"
                                    review="The quality and designs are absolutely stunning! I found the perfect saree for my sister's wedding. The staff was incredibly helpful."
                                    rating={5}
                                />
                                <TestimonialCard
                                    name="Anjali Patel"
                                    review="Shreerang Saree is my go-to place for traditional wear. The collection is vast and the quality is always top-notch."
                                    rating={5}
                                />
                                <TestimonialCard
                                    name="Meera Desai"
                                    review="I was amazed by the personalized service. They helped me choose a saree that was perfect for my occasion. Highly recommended!"
                                    rating={5}
                                />
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection><DecorativeDivider /></AnimatedSection>

                    {/* --- Address & Map Section --- */}
                    <AnimatedSection>
                        <section className="container mx-auto mt-8 max-w-7xl">
                            <div className="bg-white p-6 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gradient-animated mb-8 sm:mb-12 text-center">Visit Us Today</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
                                    <div>
                                        <div className="space-y-6 sm:space-y-8">
                                            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-transparent rounded-lg hover:shadow-md transition-shadow duration-300">
                                                <div className="text-amber-500 mt-1 flex-shrink-0"><MapPinIcon /></div>
                                                <div>
                                                    <p className="font-semibold text-lg sm:text-xl mb-2 text-slate-800">Store Location</p>
                                                    <p className="leading-relaxed text-slate-600 text-sm sm:text-base">
                                                        Shop No. 4, Daya Mansion, G, Govindji Keni Rd,<br />
                                                        Behind Hindmata Gold Cinema, Dadar(E),<br />
                                                        Mumbai, Maharashtra 400014
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-sky-50 to-transparent rounded-lg hover:shadow-md transition-shadow duration-300">
                                                <div className="text-sky-500 mt-1 flex-shrink-0"><ClockIcon /></div>
                                                <div>
                                                    <p className="font-semibold text-lg sm:text-xl mb-2 text-slate-800">Store Timings</p>
                                                    <p className="text-slate-600 text-base sm:text-lg">10:00 AM - 9:00 PM</p>
                                                    <p className="text-slate-500 text-xs sm:text-sm mt-1">Open all days of the week</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-rose-50 to-transparent rounded-lg hover:shadow-md transition-shadow duration-300">
                                                <div className="text-rose-500 mt-1 flex-shrink-0"><PhoneIcon /></div>
                                                <div>
                                                    <p className="font-semibold text-lg sm:text-xl mb-2 text-slate-800">Contact Us</p>
                                                    <p className="text-slate-600 text-base sm:text-lg">+91 98765 43210</p>
                                                    <p className="text-slate-500 text-xs sm:text-sm mt-1">Call us for inquiries</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[350px] sm:h-[400px] md:h-[450px] rounded-lg sm:rounded-xl overflow-hidden shadow-xl border-2 sm:border-4 border-amber-100 hover:border-amber-200 transition-colors duration-300">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2942.1531955769983!2d72.83813266933007!3d19.009003814718497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cfc360d42519%3A0x1c4f43f9845a5baf!2sShreerang!5e1!3m2!1sen!2sin!4v1758459483664!5m2!1sen!2sin"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen={undefined}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Shreerang Saree Location Map"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection><DecorativeDivider /></AnimatedSection>

                    {/* --- CTA Section --- */}
                    <AnimatedSection>
                        <section className="container mx-auto mt-8 text-center max-w-7xl">
                            <div className="bg-gradient-to-r from-[#8D152F] to-rose-800 p-8 sm:p-12 md:p-16 rounded-xl sm:rounded-2xl shadow-2xl text-white">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-4 sm:mb-6">Experience Elegance Like Never Before</h2>
                                <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-rose-100 max-w-2xl mx-auto px-4">
                                    Visit our store today and discover the perfect saree that celebrates your unique style and grace.
                                </p>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-[#8D152F] text-sm sm:text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                >
                                    Plan Your Visit
                                </button>
                            </div>
                        </section>
                    </AnimatedSection>

                </div>
            </div>
        </Layout>
    );
};

export default About;
