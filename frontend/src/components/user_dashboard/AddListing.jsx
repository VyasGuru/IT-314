import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
    BedDouble,
    Bath,
    Car,
    Utensils,
    Wifi,
    ShieldCheck,
    Zap,
    Leaf,
    Building,
    Play,
    Sofa,
    Home,
    Milestone,
    Calendar,
    MapPin,
    ImagePlus,
    Upload,
    Loader2,
    AlertCircle,
    CheckCircle2,
    IndianRupeeIcon,
    ChevronDown,
} from 'lucide-react';

const amenityIcons = {
    parking: Car,
    gym: Utensils,
    swimmingPool: Bath,
    wifi: Wifi,
    security: ShieldCheck,
    powerBackup: Zap,
    garden: Leaf,
    lift: Building,
    clubhouse: Home,
    playArea: Play,
    furnished: Sofa,
};

const InputField = ({ icon, name, placeholder, value, onChange, onBlur, type = 'text', required = true, min, maxLength }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={required}
            min={min}
            maxLength={maxLength}
        />
    </div>
);

const AddListing = () => {
    const navigate = useNavigate();
    const { currentUser, isEmailVerified } = useAuth();

    const [showVerificationAlert, setShowVerificationAlert] = useState(false);
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
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!isEmailVerified) {
            setShowVerificationAlert(true);
        } else {
            setShowVerificationAlert(false);
        }
    }, [isEmailVerified]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number' && Number(value) < 0) {
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        if (name === 'zipCode') {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 6) return;
        }
        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value,
            },
        }));
    };

    const handleAmenitiesChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [name]: checked,
            },
        }));
    };




    const isValidDate = (dateString) => {
        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(datePattern);
        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;

        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) return false;

        const currentYear = new Date().getFullYear();
        if (year < 1800 || year > currentYear + 5) return false;

        return true;
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        if (error) setError(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('images').click();
        }
    };

    const handleDateBlur = (e) => {
        const { value } = e.target;
        if (value && !isValidDate(value)) {
            setError('Please enter a valid date in DD/MM/YYYY format.');
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) return 'Title is required.';
        if (!formData.description.trim()) return 'Description is required.';
        if (Number(formData.price) <= 0) return 'Price must be a positive number.';
        if (Number(formData.size) <= 0) return 'Size must be a positive number.';
        if (Number(formData.bedrooms) < 0) return 'Bedrooms cannot be negative.';
        if (Number(formData.bathrooms) < 0) return 'Bathrooms cannot be negative.';
        if (Number(formData.balconies) < 0) return 'Balconies cannot be negative.';
        if (!isValidDate(formData.yearBuild)) return 'Please enter a valid Year Built in DD/MM/YYYY format.';
        if (!formData.propertyType) return 'Please select a Property Type.';
        if (!/^\d{6}$/.test(formData.location.zipCode)) return 'Zip Code must be exactly 6 digits.';
        if (images.length === 0) return 'Please upload at least one image.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            window.scrollTo(0, 0);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = await currentUser.getIdToken();
            const data = new FormData();

            Object.keys(formData).forEach((key) => {
                if (key === 'location' || key === 'amenities') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            images.forEach((file) => data.append('images', file));

            await axios.post('/api/properties/create', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('Property created successfully!');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            console.error('Error creating property:', err);
            setError('Failed to create property. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    {showVerificationAlert && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-red-800 mb-2">Email Verification Required</h2>
                            <p className="text-red-700 mb-4">
                                Your email is not verified yet. You must verify your email before you can create listings.
                            </p>
                            <button
                                onClick={() => navigate('/verify-email')}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                            >
                                Go to Verification
                            </button>
                        </div>
                    )}

                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-8">
                        Create a New Property Listing
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField icon={<Home className="text-gray-400" />} name="title" placeholder="Property Title" value={formData.title} onChange={handleChange} />
                                <InputField icon={<IndianRupeeIcon className="text-gray-400" />} name="price" placeholder="Price" value={formData.price} onChange={handleChange} type="number" min="0" />
                                <div className="md:col-span-2">
                                    <textarea
                                        name="description"
                                        placeholder="Property Description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full p-4 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <InputField icon={<BedDouble className="text-gray-400" />} name="bedrooms" placeholder="Bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" min="0" />
                                <InputField icon={<Bath className="text-gray-400" />} name="bathrooms" placeholder="Bathrooms" value={formData.bathrooms} onChange={handleChange} type="number" min="0" />
                                <InputField icon={<Milestone className="text-gray-400" />} name="size" placeholder="Size (sq ft)" value={formData.size} onChange={handleChange} type="number" min="0" />
                                <InputField icon={<Building className="text-gray-400" />} name="balconies" placeholder="Balconies" value={formData.balconies} onChange={handleChange} type="number" min="0" />
                                <InputField icon={<Calendar className="text-gray-400" />} name="yearBuild" placeholder="DD/MM/YYYY" value={formData.yearBuild} onChange={handleChange} onBlur={handleDateBlur} />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building className="text-gray-400" />
                                    </div>
                                    <select
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleChange}
                                        className="w-full pl-14 pr-10 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                        required
                                    >
                                        <option value="">Select Property Type</option>
                                        <option value="residential">House</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="land">Land</option>
                                        <option value="land">Villa</option>
                                        <option value="rental">Apartment</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Location</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField icon={<MapPin className="text-gray-400" />} name="street" placeholder="Street" value={formData.location.street} onChange={handleLocationChange} />
                                <InputField icon={<MapPin className="text-gray-400" />} name="city" placeholder="City" value={formData.location.city} onChange={handleLocationChange} />
                                <InputField icon={<MapPin className="text-gray-400" />} name="locality" placeholder="Locality" value={formData.location.locality} onChange={handleLocationChange} />
                                <InputField icon={<MapPin className="text-gray-400" />} name="state" placeholder="State" value={formData.location.state} onChange={handleLocationChange} />
                                <InputField icon={<MapPin className="text-gray-400" />} name="zipCode" placeholder="Zip Code" value={formData.location.zipCode} onChange={handleLocationChange} maxLength={6} />
                                <InputField icon={<MapPin className="text-gray-400" />} name="country" placeholder="Country" value={formData.location.country} onChange={handleLocationChange} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Amenities</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {Object.keys(formData.amenities).map((amenity) => {
                                    const Icon = amenityIcons[amenity];
                                    return (
                                        <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name={amenity}
                                                checked={formData.amenities[amenity]}
                                                onChange={handleAmenitiesChange}
                                                className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 font-medium flex items-center">
                                                {Icon && <Icon className="mr-2 text-gray-500" size={20} />}
                                                {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Images</h2>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                            >
                                <input
                                    type="file"
                                    name="images"
                                    id="images"
                                    onChange={handleImageChange}
                                    multiple
                                    className="sr-only"
                                    accept="image/*"
                                />
                                <label
                                    htmlFor="images"
                                    className="cursor-pointer block w-full h-full outline-none"
                                    onKeyDown={handleKeyDown}
                                    tabIndex="0"
                                    role="button"
                                    aria-label="Upload property images"
                                >
                                    <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        <span className="font-semibold text-blue-600">Upload files</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </label>
                            </div>
                            {imagePreviews.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-w-1 aspect-h-1">
                                            <img src={preview} alt={`Preview ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center p-4 bg-red-100 text-red-700 rounded-lg">
                                <AlertCircle className="mr-3" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center p-4 bg-green-100 text-green-700 rounded-lg">
                                <CheckCircle2 className="mr-3" />
                                {success}
                            </div>
                        )}

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center justify-center py-3 px-8 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center py-3 px-8 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                                disabled={isLoading || showVerificationAlert}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="-ml-1 mr-2 h-5 w-5" />
                                        Add Property
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddListing;
