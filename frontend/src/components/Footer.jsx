import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = ({ contactInfo }) => {
  const {
    instagram = "https://www.instagram.com/hindisamiti.mits?igsh=MWl4c2YxMHpqZ216Nw==",
    linkedin = "https://www.linkedin.com/company/hindisamiti/",
    email = "hindisamitiofficial@gmail.com",
    phone = "+918989484091"
  } = contactInfo || {};

  return (
    <footer className="bg-gradient-to-br from-orange-900 to-red-900 text-white py-12" id="contact">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Left Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-3xl font-bold mb-4 text-amber-400">हिन्दी समिति</h3>
            <p className="text-center md:text-left mb-6 text-lg leading-relaxed">
              Promoting and preserving Indian culture and the Hindi language through literature, intellectual discourse, and cultural events.
            </p>
            <div className="flex space-x-6 text-3xl">
              <motion.a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, color: '#E1306C' }}
                className="hover:text-amber-400 transition-colors"
              >
                <FaInstagram />
              </motion.a>
              <motion.a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, color: '#0077B5' }}
                className="hover:text-amber-400 transition-colors"
              >
                <FaLinkedin />
              </motion.a>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-end"
          >
            <h3 className="text-3xl font-bold mb-6 text-amber-400">संपर्क करें</h3>
            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-center md:justify-end">
                <FaEnvelope className="mr-3 text-xl" />
                <a href={`mailto:${email}`} className="hover:text-amber-400 transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-end">
                <FaPhone className="mr-3 text-xl" />
                <a href={`tel:${phone}`} className="hover:text-amber-400 transition-colors">
                  {phone}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;