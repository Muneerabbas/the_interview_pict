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
                className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-[0.5px] hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800/85 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300 sm:text-sm"
            >
                <Globe size={16} /> Share Profile
            </button>

            {mounted && isModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-md dark:bg-black/65" />
                    <div className="relative w-full max-w-sm rounded-2xl border border-slate-300/90 bg-white/98 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.32)] dark:border-slate-600/85 dark:bg-slate-900/98 animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={closeModal}
                            className="absolute right-3 top-3 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="pb-3 text-center text-lg font-bold text-slate-900 dark:text-slate-100">Share Profile</h2>
                        <div className="mb-3 border-b border-slate-200/90 dark:border-slate-700/85" />

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                                    <Share2 size={16} />
                                </div>
                                WhatsApp
                            </button>

                            <button
                                onClick={handleLinkedInShare}
                                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0077B5]/10 text-[#0077B5]">
                                    <Linkedin size={16} />
                                </div>
                                LinkedIn
                            </button>

                            <button
                                onClick={handleFacebookShare}
                                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                                    <Facebook size={16} />
                                </div>
                                Facebook
                            </button>

                            <button
                                onClick={handleTwitterShare}
                                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2]">
                                    <Twitter size={16} />
                                </div>
                                Twitter
                            </button>

                            <button
                                onClick={handleCopyToClipboard}
                                className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg border-t border-slate-200 pt-3 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    <Clipboard size={16} />
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
