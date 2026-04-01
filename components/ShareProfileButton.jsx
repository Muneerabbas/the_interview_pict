'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Facebook, Twitter, Clipboard, X, Instagram, Linkedin, Globe } from 'lucide-react';

export default function ShareProfileButton({ email, name }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message1, setMessage1] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/public/${email}` : '';
    const profileDescription = name
        ? `Check out ${name}'s professional profile on theInterview. View their interview experiences, education, and social links.`
        : `Check out this professional profile on theInterview.`;
    const message = `${profileDescription} \n${profileUrl}`;
    const encodedMessage = encodeURIComponent(message);

    const handleWhatsAppShare = () => {
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        setIsModalOpen(false);
    };

    const handleFacebookShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        window.open(facebookUrl, '_blank');
        setIsModalOpen(false);
    };

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        window.open(twitterUrl, '_blank');
        setIsModalOpen(false);
    };

    const handleLinkedInShare = () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
        window.open(linkedinUrl, '_blank');
        setIsModalOpen(false);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
            .then(() => {
                setMessage1('Profile URL copied to clipboard!');
                setTimeout(() => setMessage1(''), 3000);
            })
            .catch((err) => {
                console.error('Error copying to clipboard: ', err);
                setMessage1('Failed to copy URL.');
            });
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-bold shadow-lg hover:scale-105 transition-transform"
            >
                <Globe size={16} /> Share Profile
            </button>

            {mounted && isModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 dark:bg-black/60">
                    <div className="relative w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={closeModal}
                            className="absolute right-3 top-3 text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="mb-4 text-center text-lg font-bold text-slate-900 dark:text-slate-100">Share Profile</h2>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex items-center gap-3 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                                    <Share2 size={18} />
                                </div>
                                WhatsApp
                            </button>

                            <button
                                onClick={handleLinkedInShare}
                                className="flex items-center gap-3 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0077B5]/10 text-[#0077B5]">
                                    <Linkedin size={18} />
                                </div>
                                LinkedIn
                            </button>

                            <button
                                onClick={handleFacebookShare}
                                className="flex items-center gap-3 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                                    <Facebook size={18} />
                                </div>
                                Facebook
                            </button>

                            <button
                                onClick={handleTwitterShare}
                                className="flex items-center gap-3 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2]">
                                    <Twitter size={18} />
                                </div>
                                Twitter
                            </button>

                            <button
                                onClick={handleCopyToClipboard}
                                className="flex items-center gap-3 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800 mt-2"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                    <Clipboard size={18} />
                                </div>
                                Copy Link
                            </button>
                        </div>

                        {message1 && (
                            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                {message1}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
