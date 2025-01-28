import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ProfileView = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/api/user/complete-profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile data');
                }

                const data = await response.json();
                setProfileData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    const handleEdit = () => {
        navigate('/edit-profile');
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/user/business-profile', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete profile');
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-xl text-gray-600">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-xl text-red-600">Error: {error}</div>;
    }

    if (!profileData || !profileData.business_profile) {
        return <div className="flex items-center justify-center min-h-screen text-xl text-gray-600">No profile data found.</div>;
    }

    const { business_profile, user } = profileData;

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
            <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-3xl font-bold text-indigo-600">AI Chatbot</Link>
                    <span className="text-lg text-gray-700">Welcome, {user?.company_name}</span>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-20">
                <div className="bg-white p-10 rounded-2xl shadow-2xl">
                    <h2 className="text-4xl font-bold text-indigo-700 mb-8">Your Business Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-6 bg-indigo-50 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-indigo-600 mb-4">Basic Information</h3>
                            <p><strong>Business Name:</strong> {business_profile.business_name}</p>
                            <p><strong>Business Type:</strong> {business_profile.business_type}</p>
                            <p><strong>Website:</strong> {business_profile.website || 'N/A'}</p>
                            <p><strong>Industry:</strong> {business_profile.industry}</p>
                        </div>

                        <div className="p-6 bg-indigo-50 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-indigo-600 mb-4">Contact Information</h3>
                            <p><strong>Phone:</strong> {business_profile.phone}</p>
                            <p><strong>Address:</strong> {business_profile.address}</p>
                            <p><strong>City:</strong> {business_profile.city}</p>
                            <p><strong>State:</strong> {business_profile.state}</p>
                            <p><strong>Postal Code:</strong> {business_profile.postal_code}</p>
                            <p><strong>Country:</strong> {business_profile.country}</p>
                        </div>

                        <div className="p-6 bg-indigo-50 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-indigo-600 mb-4">Business Hours</h3>
                            {Object.entries(business_profile.business_hours).map(([day, hours]) => (
                                <p key={day}>
                                    <strong>{day}:</strong> {hours.opening || 'Closed'} - {hours.closing || 'Closed'}
                                </p>
                            ))}
                        </div>

                        <div className="p-6 bg-indigo-50 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-indigo-600 mb-4">Business Details</h3>
                            <p><strong>Description:</strong> {business_profile.description}</p>
                            <p><strong>Year Established:</strong> {business_profile.year_established || 'N/A'}</p>
                            <p><strong>Employee Count:</strong> {business_profile.employee_count || 'N/A'}</p>
                        </div>

                        <div className="p-6 bg-indigo-50 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-indigo-600 mb-4">Social Media</h3>
                            <p><strong>Facebook:</strong> {business_profile.facebook_url || 'N/A'}</p>
                            <p><strong>Instagram:</strong> {business_profile.instagram_url || 'N/A'}</p>
                            <p><strong>Twitter:</strong> {business_profile.twitter_url || 'N/A'}</p>
                        </div>

                        <div className="p-6 bg-indigo-50 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-indigo-600 mb-4">Additional Information</h3>
                            <p><strong>Specialties:</strong> {business_profile.specialties?.join(', ') || 'N/A'}</p>
                            <p><strong>Payment Methods:</strong> {business_profile.payment_methods?.join(', ') || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button 
                            onClick={handleEdit} 
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                            Edit
                        </button>
                        <button 
                            onClick={handleDelete} 
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
