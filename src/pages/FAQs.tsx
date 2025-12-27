import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
    {
        question: "How do I place an order?",
        answer: "Browse our collection, select your favorite saree, add it to cart, and proceed to checkout. You can pay using various payment methods including UPI, cards, and net banking."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery for select locations."
    },
    {
        question: "How long does delivery take?",
        answer: "Standard delivery takes 5-7 business days. Express delivery (where available) takes 2-3 business days. You'll receive tracking information once your order ships."
    },
    {
        question: "Can I return or exchange my saree?",
        answer: "Yes! We offer a 7-day return policy for unused items in original packaging. Please check our Return Policy page for detailed terms."
    },
    {
        question: "Are these sarees authentic handloom?",
        answer: "Yes, we source directly from verified weavers and artisans. Each saree comes with authenticity information where applicable."
    },
    {
        question: "How do I track my order?",
        answer: "Once shipped, you'll receive an email/SMS with tracking details. You can also track your order from the 'My Orders' section after logging in."
    },
    {
        question: "Do you offer gift packaging?",
        answer: "Yes! Select 'Gift Wrap' option during checkout for premium packaging at a small additional cost."
    },
    {
        question: "How do I care for my saree?",
        answer: "Care instructions vary by fabric. Silk sarees should be dry cleaned, while cotton sarees can be hand washed. Detailed care instructions are included with each purchase."
    }
];

const FAQItem: React.FC<{ faq: typeof faqs[0] }> = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-border rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left bg-card hover:bg-muted/50 transition-colors"
            >
                <span className="font-medium text-foreground">{faq.question}</span>
                {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-muted/30 border-t border-border">
                    <p className="text-muted-foreground">{faq.answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQs: React.FC = () => {
    return (
        <Layout>
            <div className="container-app py-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                            <HelpCircle className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-foreground">Frequently Asked Questions</h1>
                            <p className="text-muted-foreground">Find answers to common questions</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} faq={faq} />
                        ))}
                    </div>

                    <div className="mt-8 bg-primary/5 rounded-xl p-6 text-center">
                        <p className="text-muted-foreground mb-2">Still have questions?</p>
                        <Link to="/contact" className="text-primary font-medium hover:underline">
                            Contact our support team →
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FAQs;
