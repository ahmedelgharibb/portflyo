'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaSchool, FaChartBar, FaLink, FaUserTie, FaEnvelope } from 'react-icons/fa';

interface TeacherData {
  name: string;
  degree: string;
  yearsOfExperience: number;
  institutions: {
    name: string;
    type: 'school' | 'center' | 'online';
    role: string;
  }[];
  studentResults: {
    aStar: number;
    a: number;
    total: number;
  };
  links: {
    title: string;
    url: string;
  }[];
  contactEmail: string;
  workWithMeForm: string;
}

const TeacherPortfolio = () => {
  const [activeSection, setActiveSection] = useState('about');

  const teacherData: TeacherData = {
    name: "John Doe",
    degree: "M.Ed in Mathematics Education",
    yearsOfExperience: 8,
    institutions: [
      { name: "International School", type: "school", role: "Senior Mathematics Teacher" },
      { name: "Math Excellence Center", type: "center", role: "Lead Instructor" },
      { name: "Global Learning Platform", type: "online", role: "Online Tutor" }
    ],
    studentResults: {
      aStar: 45,
      a: 35,
      total: 80
    },
    links: [
      { title: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
      { title: "Research Paper", url: "https://example.com/research" },
      { title: "Teaching Blog", url: "https://example.com/blog" }
    ],
    contactEmail: "john.doe@example.com",
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
              <h2 className="text-3xl font-bold mb-6">About Me</h2>
              <div className="space-y-4">
                <p className="text-xl font-semibold">{teacherData.name}</p>
                <p className="text-gray-600">Degree: {teacherData.degree}</p>
                <p className="text-gray-600">Years of Experience: {teacherData.yearsOfExperience}</p>
              </div>
            </section>
          )}

          {activeSection === 'institutions' && (
            <section className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Teaching Institutions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teacherData.institutions.map((institution, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{institution.name}</h3>
                    <p className="text-gray-600 capitalize">{institution.type}</p>
                    <p className="text-gray-600">{institution.role}</p>
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
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {link.title}
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