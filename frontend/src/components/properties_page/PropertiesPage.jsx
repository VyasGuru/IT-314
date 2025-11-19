import React from "react";
import { MapPin, Home, Search } from "lucide-react";

const PropertiesPage = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">
          Properties
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Explore Properties Tailored for You
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse the latest listings, filter by your preferences, and save your
          favorites for later. A dedicated listings experience is coming soon.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <article className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
            <Home size={28} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Featured Homes
          </h2>
          <p className="text-gray-600">
            Get a curated list of premium residences based on your profile and
            viewing history.
          </p>
        </article>

        <article className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-5">
            <MapPin size={28} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Local Insights
          </h2>
          <p className="text-gray-600">
            Neighborhood highlights, accessibility, and price trends to help
            make confident choices.
          </p>
        </article>

        <article className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
            <Search size={28} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Smart Filters
          </h2>
          <p className="text-gray-600">
            Soon you’ll be able to search by price, amenities, property type,
            verification status, and more.
          </p>
        </article>
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center shadow-lg">
        <h3 className="text-2xl font-semibold mb-3">
          Need a property you can’t find?
        </h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Our team can help shortlist listings for rent or purchase based on
          your requirements and budget. Tell us what you’re looking for and
          we’ll keep you posted.
        </p>
        <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-sm hover:-translate-y-0.5 transition-transform">
          Contact Us
        </button>
      </div>
    </section>
  );
};

export default PropertiesPage;

