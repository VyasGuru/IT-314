import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AddListing = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        balconies: '',
        size: '',
        propertyType: '',
        yearBuild: '',
        location: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            locality: '',
            country: '',
        },
        amenities: {
            parking: false,
            gym: false,
            swimmingPool: false,
            wifi: false,
            security: false,
            powerBackup: false,
            garden: false,
            lift: false,
            clubhouse: false,
            playArea: false,
            furnished: false,
        },
        images: [],
    });
    const [images, setImages] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
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

    const handleImageChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await currentUser.getIdToken();
            const data = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key === 'location' || key === 'amenities') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            for (let i = 0; i < images.length; i++) {
                data.append('images', images[i]);
            }

            await axios.post('/api/properties/create', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Property created successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error creating property:', err);
            alert('Failed to create property.');
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Add New Listing</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                        <input type="number" name="price" id="price" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size (sq ft)</label>
                        <input type="number" name="size" id="size" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms</label>
                        <input type="number" name="bedrooms" id="bedrooms" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms</label>
                        <input type="number" name="bathrooms" id="bathrooms" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="balconies" className="block text-sm font-medium text-gray-700">Balconies</label>
                        <input type="number" name="balconies" id="balconies" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Property Type</label>
                    <select name="propertyType" id="propertyType" value={formData.propertyType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
                        <option value="">Select Property Type</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="land">Land</option>
                        <option value="rental">Rental</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="yearBuild" className="block text-sm font-medium text-gray-700">Year Built</label>
                    <input type="number" name="yearBuild" id="yearBuild" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                </div>

                <fieldset>
                    <legend className="text-base font-medium text-gray-900">Location</legend>
                    <div className="mt-4 space-y-4">
                        <input type="text" name="street" placeholder="Street" onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        <input type="text" name="city" placeholder="City" onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        <input type="text" name="locality" placeholder="Locality" onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        <input type="text" name="state" placeholder="State" onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        <input type="text" name="zipCode" placeholder="Zip Code" onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        <input type="text" name="country" placeholder="Country" onChange={handleLocationChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-base font-medium text-gray-900">Amenities</legend>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(formData.amenities).map(amenity => (
                            <div key={amenity} className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id={amenity} name={amenity} type="checkbox" onChange={handleAmenitiesChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor={amenity} className="font-medium text-gray-700">{amenity}</label>
                                </div>
                            </div>
                        ))}
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images</label>
                    <input type="file" name="images" id="images" onChange={handleImageChange} multiple className="mt-1 block w-full" required />
                </div>
                
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Property
                </button>
            </form>
        </div>
    );
};

export default AddListing;
