'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaSchool, FaChartBar, FaLink, FaUserTie, FaEnvelope } from 'react-icons/fa';
import Image from 'next/image';

interface TeacherData {
  name: string;
  degree: string;
  yearsOfExperience: number;
  profileImage: string;
  institutions: {
    name: string;
    type: 'school' | 'center' | 'online';
    role: string;
    logo?: string;
  }[];
  studentResults: {
    aStar: number;
    a: number;
    total: number;
  };
  links: {
    title: string;
    url: string;
    icon?: string;
  }[];
  contactEmail: string;
  workWithMeForm: string;
  bio: string;
}

const TeacherPortfolio = () => {
  const [activeSection, setActiveSection] = useState('about');

  const teacherData: TeacherData = {
    name: "Dr. Sarah Johnson",
    degree: "Ph.D. in Mathematics Education",
    yearsOfExperience: 12,
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop",
    bio: "Passionate mathematics educator with over a decade of experience in both traditional and online teaching environments. Specialized in advanced mathematics and exam preparation.",
    institutions: [
      { 
        name: "Cambridge International School", 
        type: "school", 
        role: "Head of Mathematics Department",
        logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&fit=crop"
      },
      { 
        name: "Math Excellence Academy", 
        type: "center", 
        role: "Lead Instructor",
        logo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop"
      },
      { 
        name: "Global Math Hub", 
        type: "online", 
        role: "Senior Online Tutor",
        logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop"
      }
    ],
    studentResults: {
      aStar: 65,
      a: 25,
      total: 90
    },
    links: [
      { 
        title: "LinkedIn Profile", 
        url: "https://linkedin.com/in/sarahjohnson",
        icon: "https://cdn-icons-png.flaticon.com/512/174/174857.png"
      },
      { 
        title: "Research Publications", 
        url: "https://researchgate.net/sarahjohnson",
        icon: "https://cdn-icons-png.flaticon.com/512/174/174857.png"
      },
      { 
        title: "Teaching Blog", 
        url: "https://sarahjohnson.teachable.com",
        icon: "https://cdn-icons-png.flaticon.com/512/174/174857.png"
      }
    ],
    contactEmail: "sarah.johnson@example.com",
    workWithMeForm: "https://forms.google.com/example"
  };

  const sections = [
    { id: 'about', icon: <FaGraduationCap />, label: 'About' },
    { id: 'experience', icon: <FaChalkboardTeacher />, label: 'Experience' },
    { id: 'institutions', icon: <FaSchool />, label: 'Institutions' },
    { id: 'results', icon: <FaChartBar />, label: 'Results' },
    { id: 'links', icon: <FaLink />, label: 'Links' },
    { id: 'work', icon: <FaUserTie />, label: 'Work With Me' },
    { id: 'contact', icon: <FaEnvelope />, label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-20 h-full bg-white shadow-lg z-50">
        <div className="flex flex-col items-center py-8 space-y-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-3 rounded-full transition-all ${
                activeSection === section.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.icon}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-20 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {activeSection === 'about' && (
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48 rounded-full overflow-hidden">
                  <Image
                    src={teacherData.profileImage}
                    alt={teacherData.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">About Me</h2>
                  <p className="text-xl font-semibold mb-2">{teacherData.name}</p>
                  <p className="text-gray-600 mb-4">{teacherData.degree}</p>
                  <p className="text-gray-600 mb-4">Years of Experience: {teacherData.yearsOfExperience}</p>
                  <p className="text-gray-700">{teacherData.bio}</p>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'institutions' && (
            <section className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Teaching Institutions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teacherData.institutions.map((institution, index) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center gap-4">
                    {institution.logo && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={institution.logo}
                          alt={institution.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{institution.name}</h3>
                      <p className="text-gray-600 capitalize">{institution.type}</p>
                      <p className="text-gray-600">{institution.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'results' && (
            <section className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Student Results (November 2024)</h2>
              <div className="h-64 flex items-end justify-center space-x-8">
                <div className="text-center">
                  <div className="bg-green-500 w-20 h-32 rounded-t-lg"></div>
                  <p className="mt-2">A* ({teacherData.studentResults.aStar}%)</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-500 w-20 h-24 rounded-t-lg"></div>
                  <p className="mt-2">A ({teacherData.studentResults.a}%)</p>
                </div>
              </div>
              <p className="text-center mt-4 text-gray-600">
                Total Success Rate: {teacherData.studentResults.total}%
              </p>
            </section>
          )}

          {activeSection === 'links' && (
            <section className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">My Links</h2>
              <div className="space-y-4">
                {teacherData.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {link.icon && (
                      <Image
                        src={link.icon}
                        alt={link.title}
                        width={24}
                        height={24}
                      />
                    )}
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'work' && (
            <section className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Work With Me</h2>
              <p className="mb-4">Interested in working together? Fill out this form:</p>
              <a
                href={teacherData.workWithMeForm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply Now
              </a>
            </section>
          )}

          {activeSection === 'contact' && (
            <section className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Contact Me</h2>
              <p className="text-gray-600">Email: {teacherData.contactEmail}</p>
              <p className="mt-4">Feel free to reach out for any inquiries or collaboration opportunities.</p>
            </section>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default TeacherPortfolio; 