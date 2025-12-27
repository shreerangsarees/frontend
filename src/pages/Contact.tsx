import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowLeft, Linkedin, Send, Loader2, Code, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const developers = [
    {
        name: 'Abhijeet Rogye',
        role: 'Full Stack Developer',
        linkedin: 'https://www.linkedin.com/in/abhijeetrogye/',
        avatar: 'AR'
    }
];

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
    };

    return (
        <Layout>
            <div className="container-app py-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <Code className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-foreground mb-4">Meet the Developers</h1>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Shreerang Saree was crafted with <Heart className="inline h-4 w-4 text-primary" /> by talented developers.
                            Connect with us on LinkedIn!
                        </p>
                    </div>

                    {/* Developers Section */}
                    <div className="grid sm:grid-cols-2 gap-6 mb-12">
                        {developers.map((dev) => (
                            <a
                                key={dev.name}
                                href={dev.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                                        {dev.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                            {dev.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{dev.role}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-[#0077B5] transition-colors">
                                        <Linkedin className="h-5 w-5" />
                                        <span className="hidden sm:inline">Connect</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="bg-card border border-border rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-foreground mb-6 text-center">
                            Send us a Message
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Your Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email Address</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <Input
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="What's this about?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Your message here..."
                                    rows={5}
                                    required
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>

                            <div className="text-center">
                                <Button type="submit" variant="hero" size="lg" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5 mr-2" />
                                    )}
                                    Send Message
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;
