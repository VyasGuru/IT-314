import React from 'react';
import { Link } from 'react-router-dom';


const missionImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop';

// Data for team members
const teamMembers = [
  { name: 'Guru Vyas' },
  { name: 'Sneh Shah' },
  { name: 'Sri Sai' },
  { name: 'Khush Patel' },
  { name: 'Rushi Gadiya' },
  { name: 'mitwa Ninama' },
  { name: 'Jeinil' },
  { name: 'Nandini Gadhvi' },
  { name: 'Prince Patel' },
  { name: 'Hardik Vala' },
];


// Sub-components for each section

const HeroSection = () => (
  <div className="bg-slate-50">
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
        Connecting You with Your Future
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
        FindMySquare was born from a simple idea: to make finding the perfect property as easy and enjoyable as possible. Discover our story, our mission, and the people dedicated to helping you.
      </p>
    </div>
  </div>
);

const MissionSection = () => (
  <div className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
      <div className="prose prose-lg text-gray-700">
        <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
        <p>
          To empower individuals and families by providing a transparent, intuitive, and comprehensive platform for all their real estate needs. We strive to replace the complexity and stress of property transactions with clarity and confidence.
        </p>
        <h3 className="text-2xl font-bold text-gray-900 mt-8">Our Vision</h3>
        <p>
          To be the most trusted and user-centric real estate marketplace, creating a future where everyone can find their perfect place to call home, seamlessly and efficiently.
        </p>
      </div>
      <div className="order-first md:order-last">
        <img
          src={missionImage}
          alt="Team collaborating in a modern office"
          className="rounded-lg shadow-xl w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
);

const ValuesSection = () => (
  <div className="bg-slate-50 py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Our Core Values</h2>
        <p className="mt-4 text-lg text-gray-600">The principles that guide our every decision.</p>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
        {/* Value 1 */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
            {/* Inline SVG for a 'Sparkle' icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L12 22M12 2L6 8M12 2L18 8M12 22L6 16M12 22L18 16M2 12L22 12M2 12L8 6M2 12L8 18M22 12L16 6M22 12L16 18" opacity="0.5" /><path d="M12 2L12 22M12 2L6 8M12 2L18 8M12 22L6 16M12 22L18 16M2 12L22 12M2 12L8 6M2 12L8 18M22 12L16 6M22 12L16 18" /></svg>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">Integrity</h3>
          <p className="mt-2 text-base text-gray-600">We operate with complete transparency and adhere to the highest ethical standards in all our interactions.</p>
        </div>
        {/* Value 2 */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
            {/* Inline SVG for a 'Users' icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">Customer-Centric</h3>
          <p className="mt-2 text-base text-gray-600">Our clients are at the heart of everything we do. Your success and satisfaction are our ultimate goals.</p>
        </div>
        {/* Value 3 */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
            {/* Inline SVG for a 'Zap' icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z" /></svg>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">Innovation</h3>
          <p className="mt-2 text-base text-gray-600">We leverage cutting-edge technology to constantly improve the property search experience for our users.</p>
        </div>
      </div>
    </div>
  </div>
);


const TeamSection = () => (
  <div className="bg-white py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Meet Our Team</h2>
        <p className="mt-4 text-lg text-gray-600">The group members of this project.</p>
      </div>
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <div key={member.name} className="text-center p-6 bg-slate-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CtaSection = () => (
  <div className="bg-blue-600">
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-extrabold text-white">Ready to Find Your Dream Home?</h2>
      <p className="mt-4 text-lg text-blue-100">
        Start your search today with our powerful tools and dedicated team by your side.
      </p>
      <div className="mt-8">
        <Link
          to="/properties"
          className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-50 transition duration-300"
        >
          Search Properties
        </Link>
      </div>
    </div>
  </div>
);


//  Main About Page Component 

const AboutPage = () => {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <ValuesSection />
      <TeamSection />
      <CtaSection />
    </>
  );
};

export default AboutPage;