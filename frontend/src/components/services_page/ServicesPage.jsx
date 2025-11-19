import React from "react";
import { ClipboardCheck, Building2, Shield, PhoneCall } from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "Property Discovery",
    description:
      "Personalized shortlists, virtual tours, and curated recommendations based on your living style.",
  },
  {
    icon: ClipboardCheck,
    title: "Documentation Support",
    description:
      "End-to-end assistance with paperwork, verification, and negotiations for both rent and purchase.",
  },
  {
    icon: Shield,
    title: "Trusted Partners",
    description:
      "We work only with verified builders, brokers, and landlords to ensure transparency and security.",
  },
  {
    icon: PhoneCall,
    title: "Dedicated Assistance",
    description:
      "Need help at any step? Your relationship manager is just a call away to guide you.",
  },
];

const ServicesPage = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-blue-600 font-semibold">
          Services
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          From Search to Settlement, We’ve Got You
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A full-stack property assistance stack—built to simplify every step of
          renting or buying real estate.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm hover:-translate-y-1 transition-transform"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Icon size={28} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {title}
            </h2>
            <p className="text-gray-600">{description}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1">
          <h3 className="text-3xl font-semibold mb-3">
            Let's craft your property journey
          </h3>
          <p className="text-blue-100 max-w-2xl">
            Tell us what the perfect home looks like and we’ll map out your next
            steps—site visits, comparisons, paperwork, and all.
          </p>
        </div>
        <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-sm hover:-translate-y-0.5 transition-transform">
          Book a Free Consultation
        </button>
      </div>
    </section>
  );
};

export default ServicesPage;

