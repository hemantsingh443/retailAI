import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessForm from './BusinessForm';

const EditBusinessProfile = () => {
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusinessProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/api/user/complete-profile', { // Corrected endpoint
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();
                setInitialData(data.business_profile); // Access business_profile from the response
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchBusinessProfile();
    }, [navigate]);

    const handleSubmitSuccess = () => {
        navigate('/profile'); // Redirect to profile after edit
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <BusinessForm 
            initialData={initialData} 
            isEdit={true} 
            onSubmitSuccess={handleSubmitSuccess} 
        />
    );
};

export default EditBusinessProfile;