import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Copy, Github, Gitlab, Linkedin, Twitter, Facebook, Instagram, Smile, X } from 'lucide-react';

// Data Structure Definitions
const countryCodes = [
  { code: '+32', country: 'BE' },
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+33', country: 'FR' },
  { code: '+49', country: 'DE' },
  { code: '+31', country: 'NL' },
].sort((a, b) => a.country.localeCompare(b.country));

const socialLinks = [
  { platform: 'X (Twitter)', icon: Twitter, url: 'https://x.com/LegalOverworked' },
  { platform: 'LinkedIn', icon: Linkedin, url: 'https://be.linkedin.com/in/jaldert-fran%C3%A7ois' },
  { platform: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/jaldert.francois' },
  { platform: 'GitHub', icon: Github, url: 'https://github.com/LegallyOverworked' },
  { platform: 'GitLab', icon: Gitlab, url: 'https://gitlab.kuleuven.be/u0149897' },
  { platform: 'HuggingFace', icon: Smile, url: 'https://huggingface.co/LegallyOverworked' },
  { platform: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/jaldertfrancois/' },
];

const additionalEmails = [
  { email: 'jaldert.francois@outlook.com', label: 'Outlook' },
  { email: 'jalfrancois@hotmail.com', label: 'Hotmail' },
];

// Subcomponent Definitions
const ContactDetails = ({ icon: Icon, label, value, showValue, onToggle, onCopy }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg mb-4">
      <div className="flex items-center">
        <Icon className="h-5 w-5 text-blue-600 mr-3" />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-gray-900 dark:text-gray-100">
            {showValue ? value : '••••••••••••'}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          {showValue ? 'Hide' : 'Show'}
        </button>
        <button
          onClick={onCopy}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const SocialLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="p-3 rounded-full transition-colors bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
    aria-label={label}
  >
    <Icon className="h-6 w-6" />
  </a>
);

const SocialModal = ({ isOpen, onClose, socialLinks, additionalEmails }) => {
  if (!isOpen) return null;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleOuterClick = (e) => {
    // Close when clicking outside the modal
    onClose();
  };

  const handleInnerClick = (e) => {
    e.stopPropagation();
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOuterClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md relative group"
        onClick={handleInnerClick}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-xl opacity-25"></div>
        
        {/* Close button (X) at top right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative max-h-[60vh] overflow-auto">
          <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Additional Contact Options
          </h3>

          <div className="space-y-6">
            {/* Social Media Links */}
            <div>
              <h4 className="text-lg font-medium mb-3">Social Media</h4>
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <div
                    key={link.platform}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <link.icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{link.platform}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{link.url}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {/* Open in new tab button */}
                      <button
                        onClick={() => openInNewTab(link.url)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={2} 
                          stroke="currentColor" 
                          className="h-4 w-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h7m0 0v7m0-7L10 17" />
                        </svg>
                      </button>

                      {/* Copy button */}
                      <button
                        onClick={() => copyToClipboard(link.url)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Emails */}
            <div>
              <h4 className="text-lg font-medium mb-3">More Emails</h4>
              <div className="space-y-3">
                {additionalEmails.map((item) => {
                  const mailtoLink = `mailto:${item.email}`;
                  return (
                    <div
                      key={item.email}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* Open in new tab: we open the mailto link in new tab if possible */}
                        <button
                          onClick={() => openInNewTab(mailtoLink)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2} 
                            stroke="currentColor" 
                            className="h-4 w-4"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h7m0 0v7m0-7L10 17" />
                          </svg>
                        </button>
                        <button
                          onClick={() => copyToClipboard(item.email)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity relative group"
          >
            <div className="absolute inset-0 bg-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <span className="relative">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function Contact() {
  // State Management
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  const [selectedCode, setSelectedCode] = useState('+32');
  const [customCode, setCustomCode] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+32',
    message: ''
  });
  const [emailError, setEmailError] = useState('');

  const contactInfo = {
    email: "jaldert.francois@kuleuven.be",
    phone: "+32 470 59 12 07",
    location: "Leuven, Belgium"
  };

  // Utility Functions
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!re.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Determine the final code: use customCode if "custom" selected
    const finalCode = selectedCode === 'custom' ? customCode : selectedCode;

    if (validateEmail(formData.email) && formData.name && formData.message) {
      const submissionData = {
        ...formData,
        countryCode: finalCode
      };
      console.log('Form submitted:', submissionData);
      // Add your submission logic here
    }
  };

  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-4">
            Get in Touch
          </h2>
          <img src="src/assets/closeup_diffusion.jpeg" alt="Closeup Diffusion" className="w-10 h-10 rounded-full" />
        </div>

        {/* Welcome Message */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">Welcome!</h3>
          <p className="text-gray-600 dark:text-gray-400">
            I am always interested in hearing about new opportunities, collaborations, or just connecting with fellow researchers and developers. Anything to do with bioinformatics, applied deep learning, statistics or software development. Feel free to reach out through any of the channels below or send me a direct message!
            <br />
            <strong>
              In Leuven and you like running? Please reach out for a fun run together! 😊
            </strong>
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
            
            <ContactDetails
              icon={Mail}
              label="Email"
              value={contactInfo.email}
              showValue={showEmail}
              onToggle={() => setShowEmail(!showEmail)}
              onCopy={() => copyToClipboard(contactInfo.email)}
            />
            
            <ContactDetails
              icon={Phone}
              label="Phone"
              value={contactInfo.phone}
              showValue={showPhone}
              onToggle={() => setShowPhone(!showPhone)}
              onCopy={() => copyToClipboard(contactInfo.phone)}
            />
            
            <ContactDetails
              icon={MapPin}
              label="Location"
              value={contactInfo.location}
              showValue={showLocation}
              onToggle={() => setShowLocation(!showLocation)}
              onCopy={() => copyToClipboard(contactInfo.location)}
            />

            <button
              onClick={() => setShowSocialModal(true)}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity relative group"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <span className="relative">More Contact Options</span>
            </button>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Send a Message</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              
              <div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    validateEmail(e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    emailError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none`}
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex space-x-2">
                  <select
                    value={selectedCode}
                    onChange={(e) => setSelectedCode(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}> 
                        {country} ({code})
                      </option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                {selectedCode === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom code (e.g. +999)"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
              </div>

              <textarea
                rows={4}
                placeholder="Your message..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              ></textarea>

              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity relative group"
              >
                <div className="absolute inset-0 bg-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <Send className="h-4 w-4 mr-2 relative" />
                <span className="relative">Send Message</span>
              </button>
            </div>
          </form>
        </div>

        {/* Social Links Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
          <div className="flex justify-center space-x-4 items-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl opacity-25 pointer-events-none"></div>
            {socialLinks.map((link) => (
              <SocialLink
                key={link.platform}
                href={link.url}
                icon={link.icon}
                label={link.platform}
              />
            ))}
          </div>
        </div>

        {/* Social Modal */}
        <SocialModal
          isOpen={showSocialModal}
          onClose={() => setShowSocialModal(false)}
          socialLinks={socialLinks}
          additionalEmails={additionalEmails}
        />
      </div>
    </div>
  );
}
