'use client';
import { Share2 } from 'lucide-react';

export default function ShareButton({ id, data }) {
  const handleShare = () => {
    // Generate the article URL using the ID
    const articleUrl = `https://localhost:3000/single/${id}`;

    // Generate the article description
    const articleDescription = `Read ${data.name}'s detailed interview experience as ${data.role} at ${data.company}. Learn about the interview process, questions asked, and valuable insights for ${data.branch} students.`;

    // Construct the WhatsApp message using the description and URL
    const message = `${articleDescription} \n${articleUrl}`;
    const encodedMessage = encodeURIComponent(message);

    // Construct WhatsApp share URL
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp share window
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className="absolute top-0 right-0 p-2 text-gray-600 hover:text-[#25D366] transition-colors duration-200 flex items-center gap-2 rounded-full hover:bg-gray-100"
      aria-label="Share article on WhatsApp"
    >
      <Share2 size={20} />
    </button>
  );
}
