'use client';
import { useState } from 'react';
import { Share2, Facebook, Twitter, Clipboard, X, Instagram, Linkedin } from 'lucide-react';

export default function ShareButton({ id, data }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message1, setMessage1] = useState('');

  const articleUrl = `https://www.pict.live/single/${id}`;
  const articleDescription = `Read ${data.name}'s detailed interview experience as ${data.role} at ${data.company}. Learn about the interview process, questions asked, and valuable insights for ${data.branch} students.`;
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
        className="absolute top-0 right-0 p-2 text-gray-600 hover:text-[#25D366] transition-colors duration-200 flex items-center gap-2 rounded-full hover:bg-gray-100"
        aria-label="Share article"
      >
        <Share2 size={20} />
      </button>

      <div className="relative">
        {/* Modal for Share Options */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-4 w-64 relative">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <h2 className="text-lg font-semibold text-center mb-4">Share this Article</h2>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-2 p-2 text-[#25D366] hover:bg-gray-100 rounded-md"
                  aria-label="Share on WhatsApp"
                >
                  <Share2 size={20} />
                  WhatsApp
                </button>
                
                <button
                  onClick={handleLinkedInShare}
                  className="flex items-center gap-2 p-2 text-[#0077B5] hover:bg-gray-100 rounded-md"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin size={20} />
                  LinkedIn
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="flex items-center gap-2 p-2 text-blue-600 hover:bg-gray-100 rounded-md"
                  aria-label="Share on Facebook"
                >
                  <Facebook size={20} />
                  Facebook
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="flex items-center gap-2 p-2 text-[#1DA1F2] hover:bg-gray-100 rounded-md"
                  aria-label="Share on Twitter"
                >
                  <Twitter size={20} />
                  Twitter
                </button>
               
                <button
                  onClick={handleInstagramShare}
                  className="flex items-center gap-2 p-2 text-[#E1306C] hover:bg-gray-100 rounded-md"
                  aria-label="Share on Instagram"
                >
                  <Instagram size={20} />
                  Instagram
                </button>
              </div>
            </div>
          </div>
        )}
        {isModalOpen && message1 && (
          <div
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[#E7F3FF] text-[#1D1D1D] px-4 py-2 rounded-lg shadow-lg text-lg z-50 flex items-center space-x-2 animate-slideIn whitespace-nowrap"
          >
            <Clipboard className="h-6 w-6 text-[#1D1D1D]" />
            <span>{message1}</span>
          </div>
        )}
      </div>
    </>
  );
}
