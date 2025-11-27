import { useEffect } from "react";
import { Link } from "react-router-dom";
import { GitCompare, RefreshCcw, Trash2 } from "lucide-react";
import { useComparison } from "../../contexts/ComparisonContext";
import { formatLocation } from "../../utils/formatLocation";

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const ComparisonTableRow = ({ label, values }) => (
  <div
    className="grid gap-4 py-4 border-b last:border-b-0"
    style={{ gridTemplateColumns: `200px repeat(${values.length}, minmax(200px, 1fr))` }}
  >
    <div className="text-sm font-semibold text-gray-500">{label}</div>
    {values.map((value, index) => (
      <div key={`${label}-${index}`} className="text-sm text-gray-900">
        {value}
      </div>
    ))}
  </div>
);

export default function PropertyComparisonPage() {
  const {
    properties,
    loading,
    error,
    refreshComparison,
    removeProperty,
    clearAll,
  } = useComparison();

  useEffect(() => {
    refreshComparison();
  }, [refreshComparison]);

  const hasEnoughProperties = properties.length >= 2;

  const attributeRows = [
    {
      label: "Price",
      getValue: (property) => formatCurrency(property?.price),
    },
    {
      label: "Location",
      getValue: (property) => formatLocation(property?.location),
    },
    {
      label: "Type",
      getValue: (property) =>
        property?.propertyType
          ? property.propertyType.replace(/^\w/, (c) => c.toUpperCase())
          : "N/A",
    },
    {
      label: "Size",
      getValue: (property) =>
        property?.size ? `${property.size} sq ft` : property?.area || "N/A",
    },
    {
      label: "Bedrooms",
      getValue: (property) => property?.bedrooms ?? "N/A",
    },
    {
      label: "Bathrooms",
      getValue: (property) => property?.bathrooms ?? "N/A",
    },
    {
      label: "Year Built",
      getValue: (property) => property?.yearBuild || property?.yearBuilt || "N/A",
    },
    {
      label: "Status",
      getValue: (property) =>
        property?.status
          ? property.status.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())
          : "N/A",
    },
    {
      label: "Key Amenities",
      getValue: (property) => {
        if (!property?.amenities || typeof property.amenities !== "object") {
          return "—";
        }
        const enabled = Object.entries(property.amenities)
          .filter(([, enabled]) => enabled)
          .map(([name]) =>
            name
              .replace(/([A-Z])/g, " $1")
              .replace(/^\w/, (c) => c.toUpperCase())
          );
        return enabled.length > 0 ? enabled.join(", ") : "—";
      },
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
        <div>
          <p className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Property Comparison
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compare Your Favorite Properties
          </h1>
          <p className="text-gray-600">
            Select up to four properties to compare price, size, amenities, and more side by side.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={refreshComparison}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
          <Link
            to="/properties"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add More Properties
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          Fetching comparison list...
        </div>
      ) : properties.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <p className="text-xl font-semibold mb-2">
            No properties selected yet
          </p>
          <p className="text-gray-600 mb-6">
            Choose at least two properties from the listings page and click
            &ldquo;Compare&rdquo; to see them side by side.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      ) : !hasEnoughProperties ? (
        <div className="border border-amber-200 bg-amber-50 rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold text-amber-800 mb-2">
            Almost there!
          </p>
          <p className="text-amber-700">
            Add one more property to unlock the full comparison experience.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div
            className="grid gap-4 border-b px-6 py-6"
            style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(200px, 1fr))` }}
          >
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Overview
            </div>
            {properties.map((property) => (
              <div
                key={property._id || property.id}
                className="rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="aspect-video rounded-lg overflow-hidden mb-3">
                  <img
                    src={property?.images?.[0] || "/placeholder.jpg"}
                    alt={property?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <p className="font-semibold text-gray-900 mb-1">
                  {property?.title}
                </p>
                <p className="text-sm text-gray-500">
                  {formatLocation(property?.location)}
                </p>
                <button
                  className="mt-4 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  onClick={() => removeProperty(property._id || property.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="px-6">
            {attributeRows.map((row) => (
              <ComparisonTableRow
                key={row.label}
                label={row.label}
                values={properties.map((property) => row.getValue(property))}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

