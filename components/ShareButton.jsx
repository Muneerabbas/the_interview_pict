'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Facebook, Twitter, Clipboard, X, Instagram, Linkedin } from 'lucide-react';

export default function ShareButton({ id, data }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message1, setMessage1] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const articleUrl = `https://www.pict.live/single/${id}`;
  const articleDescription = data?.name
    ? `Read ${data.name}'s detailed interview experience as ${data.role} at ${data.company}. Learn about the interview process, questions asked, and valuable insights for ${data.branch} students.`
    : `Read this interview experience on theInterview.`;
  const message = `${articleDescription} \n${articleUrl}`;
  const encodedMessage = encodeURIComponent(message);

  // Function to handle WhatsApp sharing
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsModalOpen(false);
  };

  // Function to handle Facebook sharing
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(facebookUrl, '_blank');
    setIsModalOpen(false);
  };

  // Function to handle Twitter sharing
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
    window.open(twitterUrl, '_blank');
    setIsModalOpen(false);
  };

  // Function to handle LinkedIn sharing
  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
    window.open(linkedinUrl, '_blank');
    setIsModalOpen(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(articleUrl)
      .then(() => {
        setMessage1('Article URL copied to clipboard!');
        setIsModalOpen(true);
      })
      .catch((err) => {
        console.error('Error copying to clipboard: ', err);
        setMessage1('Failed to copy URL.');
        setIsModalOpen(true);
      });
  };

  // Function to handle Instagram sharing (opens Instagram app for manual sharing)
  const handleInstagramShare = () => {
    const shareUrl = `https://www.instagram.com/stories`;
    window.open(shareUrl, '_blank');
    setIsModalOpen(false);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => {
          handleCopyToClipboard();
          setIsModalOpen(true);
        }}
        className="absolute right-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-200 hover:text-blue-700 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300 sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-2 sm:text-sm sm:font-semibold"
        aria-label="Share article"
      >
        <Share2 size={16} />
        <span className="hidden sm:inline">Share</span>
      </button>

      <div className="relative">
        {/* Modal for Share Options */}
        {mounted && isModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 dark:bg-black/60">
            <div className="relative w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <h2 className="mb-4 text-center text-lg font-bold text-slate-900 dark:text-slate-100">Share this Article</h2>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-2 rounded-lg p-2 text-[#25D366] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Share on WhatsApp"
                >
                  <Share2 size={18} />
                  WhatsApp
                </button>

                <button
                  onClick={handleLinkedInShare}
                  className="flex items-center gap-2 rounded-lg p-2 text-[#0077B5] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin size={18} />
                  LinkedIn
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="flex items-center gap-2 rounded-lg p-2 text-blue-600 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Share on Facebook"
                >
                  <Facebook size={18} />
                  Facebook
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="flex items-center gap-2 rounded-lg p-2 text-[#1DA1F2] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Share on Twitter"
                >
                  <Twitter size={18} />
                  Twitter
                </button>

                <button
                  onClick={handleInstagramShare}
                  className="flex items-center gap-2 rounded-lg p-2 text-[#E1306C] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Share on Instagram"
                >
                  <Instagram size={18} />
                  Instagram
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
        {mounted && isModalOpen && message1 && createPortal(
          <div
            className="fixed bottom-24 left-1/2 z-[100] flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 transform items-center justify-center space-x-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-slate-800 shadow-lg animate-slideIn dark:border-cyan-500/35 dark:bg-cyan-950/45 dark:text-slate-100"
          >
            <Clipboard className="h-5 w-5 text-blue-700 dark:text-cyan-300" />
            <span className="text-center">{message1}</span>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}
