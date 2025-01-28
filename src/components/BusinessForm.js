import React, { useState, useEffect } from 'react';

const BusinessForm = ({ onBusinessCreated, initialData, isEdit, onSubmitSuccess }) => {
    const defaultFormData = {
        business_name: '',
        business_type: '',
        website: '',
        industry: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        business_hours: {
           monday: {opening: '', closing: ''},
           tuesday: {opening: '', closing: ''},
           wednesday: {opening: '', closing: ''},
           thursday: {opening: '', closing: ''},
           friday: {opening: '', closing: ''},
           saturday: {opening: '', closing: ''},
           sunday: {opening: '', closing: ''}
        },
        description: '',
        year_established: '',
        employee_count: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        specialties: [],
        payment_methods: [],
        chatbot_name:'',
        greeting_message:'',
        tone:'',
        primary_color:'#ffffff',
        secondary_color:'#000000',
        chat_bubble_position:'bottom-right',
        auto_show_delay:0,
        enable_voice:false,
        enable_file_sharing:false,
        max_message_length:500,
        show_business_hours:true,
        out_of_hours_message: 'Sorry, we are currently outside of business hours.',
        enable_analytics:true,
        save_chat_history:true,
        enable_email_transcript:false

    };
    const [formData, setFormData] = useState(defaultFormData);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (initialData) {
            const processedData = Object.keys(initialData).reduce((acc, key) => {
                acc[key] = initialData[key] === null ? '' : initialData[key];
                return acc;
            }, {});
            setFormData(processedData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
     const handleHoursChange = (e, day) => {
        setFormData({
            ...formData,
            business_hours: {
                ...formData.business_hours,
                [day]: {
                   ...formData.business_hours[day],
                   [e.target.name]: e.target.value
                }
            }
        });
    };
    const handleSpecialtiesChange = (e) => {
         const specialtiesList = e.target.value.split(",").map(item => item.trim());
          setFormData({
            ...formData,
            specialties: specialtiesList
        });
    };
    const handlePaymentMethodsChange = (e) => {
         const paymentMethodsList = e.target.value.split(",").map(item => item.trim());
          setFormData({
            ...formData,
           payment_methods: paymentMethodsList
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

         const token = localStorage.getItem('token');
        if(!token){
           setError("You are not logged in, please login");
          return;
        }
        try {
            const payload = {
                ...formData,
                year_established: formData.year_established ? parseInt(formData.year_established, 10) : null,
                employee_count: formData.employee_count ? parseInt(formData.employee_count, 10) : null,
                facebook_url: formData.facebook_url || null,
                instagram_url: formData.instagram_url || null,
                twitter_url: formData.twitter_url || null,
                website: formData.website || null
            };

           const config = {
             chatbot_name: formData.chatbot_name,
             greeting_message: formData.greeting_message,
             tone: formData.tone,
             primary_color:formData.primary_color || '#ffffff', // changed
             secondary_color:formData.secondary_color || '#000000', // changed
             chat_bubble_position: formData.chat_bubble_position || 'bottom-right', // changed
             auto_show_delay: formData.auto_show_delay ? parseInt(formData.auto_show_delay, 10): 0,
             enable_voice: formData.enable_voice,
             enable_file_sharing:formData.enable_file_sharing,
             max_message_length: formData.max_message_length ? parseInt(formData.max_message_length, 10) : 500,
             show_business_hours: formData.show_business_hours,
             out_of_hours_message: formData.out_of_hours_message || 'Sorry, we are currently outside of business hours.', // changed
             enable_analytics:formData.enable_analytics,
             save_chat_history: formData.save_chat_history,
              enable_email_transcript:formData.enable_email_transcript,
         }
           console.log("Payload:", payload); // new log
           console.log("Config:", config);
            const method = isEdit ? 'PUT' : 'POST';
            const response = await fetch('http://localhost:8000/api/user/business-profile', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`
                },
                  body: JSON.stringify({
                    profile: payload,
                      config: config
                }),
            });


             if (!response.ok) {
                  const data = await response.json();
                  console.error("Frontend Error", data);
                  if (data && data.detail && Array.isArray(data.detail)) {
                       const errorMessages = data.detail.map(error => error.msg).join(', ');
                       setError(errorMessages);
                   }
                    else{
                        setError("Failed to create profile, please try again.");
                    }
                  return;
            }
            const data = await response.json();
            if (isEdit && onSubmitSuccess) onSubmitSuccess();
            else {
                setSuccess("Business profile updated successfully");
                onBusinessCreated();
            }
        } catch (err) {
           console.error("Frontend Error", err);
             if(err && err.message && typeof(err.message) === 'string'){
                setError(err.message)
              }else{
                 setError("Failed to create profile, please try again.");
            }
        }
    };
    return (
        <div className="bg-white p-6 md:p-8 rounded-xl max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                {isEdit ? "Update Business Profile" : "Create Business Profile"}
            </h2>
            
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-700 font-medium flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {success}
                    </p>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700 font-medium flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Business Information Section */}
                <div className="space-y-6 border-b border-gray-200 pb-8">
                    <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Business Name, Type, Industry, Website */}
                        {['business_name', 'business_type', 'industry', 'website'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {field.replace('_', ' ')}
                                </label>
                                <input
                                    type="text"
                                    name={field}
                                    required={field !== 'website'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData[field]}
                                    onChange={handleChange}
                                    placeholder={field === 'website' ? 'https://example.com' : ''}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-6 border-b border-gray-200 pb-8">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Phone, Address, City, State */}
                        {['phone', 'address', 'city', 'state'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {field}
                                </label>
                                <input
                                    type="text"
                                    name={field}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData[field]}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                        {/* Postal Code and Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                            <input
                                type="text"
                                name="postal_code"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.postal_code}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <input
                                type="text"
                                name="country"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Business Hours Section */}
                <div className="space-y-6 border-b border-gray-200 pb-8">
                    <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.keys(formData.business_hours).map(day => (
                            <div key={day} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 capitalize">{day}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        name="opening"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                        value={formData.business_hours[day]?.opening || ''}
                                        onChange={(e) => handleHoursChange(e, day)}
                                    />
                                    <input
                                        type="time"
                                        name="closing"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                        value={formData.business_hours[day]?.closing || ''}
                                        onChange={(e) => handleHoursChange(e, day)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-6 border-b border-gray-200 pb-8">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Description, Year Established, Employee Count */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                required
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                        {['year_established', 'employee_count'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {field.replace('_', ' ')}
                                </label>
                                <input
                                    type="number"
                                    name={field}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData[field]}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                    </div>

                     {/* Social Media Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['facebook_url', 'instagram_url', 'twitter_url'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {field.replace('_url', '')}
                                </label>
                                <input
                                    type="url"
                                    name={field}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData[field]}
                                    onChange={handleChange}
                                    placeholder={`https://${field.split('_')[0]}.com/username`}
                                />
                            </div>
                        ))}
                    </div>

                     {/* Specialties and Payment Methods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                            <input
                                type="text"
                                name="specialties"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.specialties.join(', ')}
                                onChange={handleSpecialtiesChange}
                                placeholder="Comma separated list (e.g., Catering, Events)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Methods</label>
                            <input
                                type="text"
                                name="payment_methods"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.payment_methods.join(', ')}
                                onChange={handlePaymentMethodsChange}
                                placeholder="Comma separated list (e.g., Cash, Credit Card)"
                            />
                        </div>
                    </div>

                </div>
                {/* Chatbot Config */}
                 <div className="space-y-6 ">
                     <h3 className="text-lg font-semibold text-gray-900">Chatbot Configuration</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chatbot Name, Greeting Message, Tone */}
                        {['chatbot_name', 'greeting_message', 'tone'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {field.replace('_', ' ')}
                                </label>
                                <input
                                    type="text"
                                    name={field}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData[field]}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                         {/* Primary Color, Secondary Color, Chat Bubble Position */}
                            {['primary_color','secondary_color', 'chat_bubble_position'].map((field) => (
                            <div key={field}>
                                 <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {field.replace('_', ' ')}
                                </label>
                                <input
                                    type="text"
                                    name={field}
                                     required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData[field]}
                                     onChange={handleChange}
                                />
                            </div>
                        ))}
                         {/* Auto Show Delay, Max Message Length */}
                        {['auto_show_delay','max_message_length'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {field.replace('_', ' ')}
                                </label>
                                <input
                                    type="number"
                                    name={field}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData[field]}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                          {/*Enable Voice, Enable File Sharing*/}
                         {['enable_voice', 'enable_file_sharing','show_business_hours', 'enable_analytics','save_chat_history','enable_email_transcript'].map((field) => (
                             <div key={field} className="flex items-center">
                                  <input
                                     type="checkbox"
                                     name={field}
                                     checked={formData[field]}
                                      onChange={(e) => setFormData({...formData, [field]: e.target.checked})}
                                      className="mr-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                  <label className="block text-sm font-medium text-gray-700 capitalize">{field.replace('_', ' ')}</label>
                             </div>
                        ))}
                         {/* Out of hours message */}
                         <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">out of hours message</label>
                            <input
                                    type="text"
                                    name="out_of_hours_message"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.out_of_hours_message}
                                    onChange={handleChange}
                                />
                       </div>
                 </div>
            </div>

               {/* Submit Button - Updated styling */}
               <div className="mt-8 flex justify-center">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                    >
                        <span>{isEdit ? "Update Profile" : "Create Profile"}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BusinessForm;