import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const EditListing = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [property, setProperty] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await api.get(`/properties/${propertyId}`);
                const currentProperty = response.data.data;

                if (currentProperty) {
                    setProperty(currentProperty);
                    setFormData({
                        title: currentProperty.title,
                        description: currentProperty.description,
                        price: currentProperty.price,
                        bedrooms: currentProperty.bedrooms,
                        bathrooms: currentProperty.bathrooms,
                        balconies: currentProperty.balconies, 
                        size: currentProperty.size,
                        propertyType: currentProperty.propertyType,
                        yearBuild: currentProperty.yearBuild,
                        location: currentProperty.location,
                        amenities: currentProperty.amenities,
                    });
                } else {
                    setError('Property not found.');
                }
            } catch (err) {
                setError('Error fetching property details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number' && Number(value) < 0) {
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, location: { ...formData.location, [name]: value } });
    };

    const handleAmenitiesChange = (e) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, amenities: { ...formData.amenities, [name]: checked } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                amenities: JSON.stringify(formData.amenities),
                location: JSON.stringify(formData.location),
            };
            await api.patch(`/properties/update-details/${propertyId}`, dataToSend);
            alert('Property updated successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error updating property:', err);
            alert('Failed to update property.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!property) return <div>Property not found.</div>

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                        <input type="number" name="price" id="price" value={formData.price || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" min="0" />
                    </div>
                    <div>
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size (sq ft)</label>
                        <input type="number" name="size" id="size" value={formData.size || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" min="0" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms</label>
                        <input type="number" name="bedrooms" id="bedrooms" value={formData.bedrooms || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" min="0" />
                    </div>
                    <div>
                        <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms</label>
                        <input type="number" name="bathrooms" id="bathrooms" value={formData.bathrooms || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" min="0" />
                    </div>
                    <div>
                        <label htmlFor="balconies" className="block text-sm font-medium text-gray-700">Balconies</label>
                        <input type="number" name="balconies" id="balconies" value={formData.balconies || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" min="0" />
                    </div>
                </div>
                <div>
                    <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Property Type</label>
                    <select name="propertyType" id="propertyType" value={formData.propertyType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="">Select Property Type</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Land">Land</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="yearBuild" className="block text-sm font-medium text-gray-700">Year Built</label>
                    <input type="number" name="yearBuild" id="yearBuild" value={formData.yearBuild || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" min="0" />
                </div>

                <fieldset>
                    <legend className="text-base font-medium text-gray-900">Location</legend>
                    <div className="mt-4 space-y-4">
                        <input type="text" name="street" placeholder="Street" value={formData.location?.street || ''} onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        <input type="text" name="city" placeholder="City" value={formData.location?.city || ''} onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        <input type="text" name="state" placeholder="State" value={formData.location?.state || ''} onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        <input type="text" name="zipCode" placeholder="Zip Code" value={formData.location?.zipCode || ''} onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-base font-medium text-gray-900">Amenities</legend>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(formData.amenities || {}).map(amenity => (
                            <div key={amenity} className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id={amenity} name={amenity} type="checkbox" checked={formData.amenities[amenity] || false} onChange={handleAmenitiesChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor={amenity} className="font-medium text-gray-700">{amenity}</label>
                                </div>
                            </div>
                        ))}
                    </div>
                </fieldset>
                
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Update Property
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditListing;
