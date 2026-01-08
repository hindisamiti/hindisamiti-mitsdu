import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const AboutSection = () => {
  return (
    <section id="about" className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
      {/* Elegant gradient background with cultural pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with cultural quote - UPDATED: Removed star line and changed colors to brown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >

          <h2 className="pt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900 mb-4" >
            हमारे बारे में
          </h2>
          <div className="inline-block">
            <span className="text-lg sm:text-xl md:text-2xl font-medium tracking-wide text-orange-900">
              About Us
            </span>

            <div className="h-1 rounded-full mt-2 bg-orange-900"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-3xl mx-auto px-4"
          >
            <blockquote className="relative">
              <span className="absolute -top-4 -left-2 text-6xl text-orange-300 opacity-50 font-serif">"</span>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-orange-900 font-medium italic px-8">
                निज भाषा उन्नति अहै, सब उन्नति को मूल।<br className="hidden sm:block" />
                बिन निज भाषा-ज्ञान के, मिटत न हिय को सूल।।
              </p>
              <span className="absolute -bottom-4 -right-2 text-6xl text-orange-300 opacity-50 font-serif">"</span>
              <footer className="mt-4 text-sm sm:text-base text-orange-700 font-semibold">
                — भारतेंदु हरिश्चंद्र
              </footer>
            </blockquote>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 lg:mb-20">
          {/* Logo Section - UPDATED: Changed to brown colors and removed EST 2017 badge */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center lg:justify-start order-1"
          >
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              {/* Outer decorative mandala ring */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
                  <defs>
                    <linearGradient id="mandalaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#8B5A3C', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#6B4423', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#mandalaGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
                  {[...Array(8)].map((_, i) => (
                    <circle
                      key={i}
                      cx={100 + 80 * Math.cos((i * Math.PI) / 4)}
                      cy={100 + 80 * Math.sin((i * Math.PI) / 4)}
                      r="8"
                      fill="url(#mandalaGradient)"
                      opacity="0.6"
                    />
                  ))}
                </svg>
              </div>

              {/* Main logo container with brown design */}
              <div className="relative group perspective-1000">
                {/* Glowing background layers - changed to brown */}
                <div className="absolute -inset-4 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse" style={{ background: 'linear-gradient(to right, #f59e0b, #f97316, #ef4444)' }}></div>
                <div className="absolute -inset-2 rounded-full blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500" style={{ background: 'linear-gradient(to right, #f59e0b, #f97316, #ef4444)' }} ></div>

                {/* Ornate outer frame - brown gradient */}
                <div className="relative bg-gradient-to-br from-white via-orange-50 to-amber-50 p-4 sm:p-6 rounded-full shadow-2xl border-4 border-transparent" style={{
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #f59e0b, #f97316, #ef4444) border-box',
                }}>

                  {/* Inner decorative ring with traditional pattern */}
                  <div className="relative bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50 p-3 sm:p-4 rounded-full shadow-inner">

                    {/* Cultural pattern overlay */}
                    <div className="absolute inset-0 rounded-full opacity-10 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <pattern id="culturalPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M10,0 L10,20 M0,10 L20,10" stroke="#f97316" strokeWidth="0.5" fill="none" />
                          <circle cx="10" cy="10" r="2" fill="#f97316" />
                        </pattern>
                        <rect width="100" height="100" fill="url(#culturalPattern)" />
                      </svg>

                    </div>

                    {/* Logo circle with brown gradient */}
                    <div className="relative aspect-square rounded-full flex items-center justify-center shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500" style={{ background: 'linear-gradient(135deg, #b07a1eff, #a26335ff, #be2626ff)' }}>

                      {/* Radial light effect */}
                      <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent opacity-50"></div>

                      {/* Logo image */}
                      <div className="relative z-10 w-[85%] h-[85%] flex items-center justify-center">
                        <img
                          src={logo}
                          alt="Hindi Samiti Logo"
                          className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Subtle shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>

                      {/* Inner glow ring */}
                      <div className="absolute inset-2 rounded-full border-2 border-white/20"></div>
                    </div>
                  </div>

                  {/* Decorative corner elements - brown colors */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-10 sm:h-10">
                    <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #C19A6B, #8B5A3C)' }}></div>

                  </div>

                  <div className="absolute -bottom-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg animate-pulse delay-200" style={{ background: 'linear-gradient(135deg, #6B4423, #8B5A3C)' }}></div>

                  <div className="absolute top-1/4 -right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md animate-bounce delay-300" style={{ background: 'linear-gradient(135deg, #A0826D, #C19A6B)' }}></div>

                  <div className="absolute bottom-1/3 -left-3 w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md animate-bounce delay-500" style={{ background: 'linear-gradient(135deg, #8B5A3C, #6B4423)' }}></div>
                </div>
              </div>

              {/* Organization name with elegant typography */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-center mt-8"
              >
                <h3 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#6B4423' }}>
                  हिन्दी समिति
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium" style={{ color: '#8B5A3C' }}>
                  <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #A0826D)' }}></div>
                  <span>Since 2017</span>
                  <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #A0826D)' }}></div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-8 sm:space-y-10 order-2"
          >
            {/* Foundation */}
            <div className="group">
              <div className="flex items-start gap-3 sm:gap-4 mb-3">
                <div className="flex-shrink-0 w-1 sm:w-1.5 h-10 sm:h-12 bg-gradient-to-b from-orange-500 via-red-500 to-orange-600 rounded-full group-hover:scale-105 transition-transform"></div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">
                  Our Foundation
                </h3>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed pl-6 sm:pl-8">
                हिन्दी समिति की स्थापना वर्ष 2017 में हिन्दी भाषा के प्रति निष्ठा एवं समर्पण रखने वाले विद्यार्थियों के एक उत्साही समूह द्वारा की गई। स्थापना के पश्चात् समिति ने निरंतर सक्रियता के साथ कार्य करते हुए स्वयं को परिसर की एक प्रमुख सांस्कृतिक संस्था के रूप में स्थापित किया है। समिति का उद्देश्य हिन्दी साहित्य, भाषा एवं भारतीय सांस्कृतिक विरासत के संरक्षण, संवर्धन एवं प्रचार-प्रसार के लिए निरंतर प्रयासरत रहना है।
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="group">
              <div className="flex items-start gap-3 sm:gap-4 mb-3">
                <div className="flex-shrink-0 w-1 sm:w-1.5 h-10 sm:h-12 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 rounded-full group-hover:scale-105 transition-transform"></div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">
                  Mission & Vision
                </h3>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed pl-6 sm:pl-8">
                हमारा उद्देश्य रचनात्मक गतिविधियों, सांस्कृतिक प्रस्तुतियों एवं साहित्यिक आयोजनों के माध्यम से हिन्दी भाषा और भारतीय परम्पराओं के प्रति अनुराग को प्रोत्साहित करना है, जिसके परिणामस्वरूप एक ऐसा सजीव समुदाय निर्मित हो जो भारतीय विरासत की समृद्धता का उल्लासपूर्वक उत्सव मनाए।
              </p>
            </div>

            {/* What We Do */}
            <div className="group">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-1 sm:w-1.5 h-10 sm:h-12 bg-gradient-to-b from-red-500 via-orange-600 to-amber-500 rounded-full group-hover:scale-105 transition-transform"></div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">
                  What We Do
                </h3>
              </div>
              <div className="space-y-4 pl-6 sm:pl-8">
                {[
                  "हिन्दी भाषा के प्रचार-प्रसार एवं संवर्धन हेतु वाद-विवाद, भाषण, काव्य-पाठ एवं रचनात्मक लेखन गतिविधियों का आयोजन।",
                  "विद्यार्थियों को भारतीय संस्कृति, मूल्यों एवं परम्पराओं से जोड़ने हेतु सांस्कृतिक एवं वैचारिक कार्यक्रमों का संचालन।",
                  "लेखन-कौशल, भाषिक अभिव्यक्ति एवं विचार-प्रस्तुति को सुदृढ़ करने हेतु कार्यशालाओं एवं प्रतियोगिताओं का आयोजन।",
                  "विद्यार्थियों की सृजनात्मक एवं साहित्यिक प्रतिभा के अभिव्यक्ति हेतु एक गरिमामय एवं प्रेरक मंच प्रदान करना।"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="flex items-start gap-3 sm:gap-4 group/item hover:translate-x-2 transition-transform duration-300"
                  >
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full group-hover/item:scale-125 transition-transform"></div>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section - UPDATED: Removed emojis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[
            { number: "50+", label: "Events Organized", color: "from-orange-500 to-red-500" },
            { number: "2000+", label: "Students Engaged", color: "from-amber-500 to-orange-500" },
            { number: "Top 5", label: "Clubs of Institute", color: "from-red-500 to-orange-600" },
            { number: "9", label: "Years of Excellence", color: "from-orange-600 to-yellow-600" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group relative"
            >
              {/* Glowing background */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300`}></div>

              {/* Card */}
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-xl border border-orange-100 group-hover:border-orange-200 transition-all duration-300">
                {/* Number */}
                <h4 className={`text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </h4>

                {/* Label */}
                <p className="text-xs sm:text-sm lg:text-base text-orange-900 font-semibold leading-tight">
                  {stat.label}
                </p>

                {/* Decorative dot */}
                <div className={`w-2 h-2 bg-gradient-to-r ${stat.color} rounded-full mx-auto mt-3 group-hover:animate-pulse`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#fff6e6" fillOpacity="0.5" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
};

export default AboutSection;