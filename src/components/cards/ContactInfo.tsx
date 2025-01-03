import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

interface ContactInfoProps {
  email: string;
  phone: string;
  location: string;
}

export function ContactInfo({ email, phone, location }: ContactInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-gray-900 dark:text-gray-100">{email}</p>
          </div>
        </div>

        <div className="flex items-center">
          <Phone className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="text-gray-900 dark:text-gray-100">{phone}</p>
          </div>
        </div>

        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
            <p className="text-gray-900 dark:text-gray-100">{location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}