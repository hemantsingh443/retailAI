import React, { useState, useEffect } from 'react';

const ChatbotWidget = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [businessId, setBusinessId] = useState(null);
    const [error, setError] = useState('');

     useEffect(() => {
        const fetchBusinessId = async () => {
             const token = localStorage.getItem('token');
            try {
               const response = await fetch('http://localhost:8000/api/user/complete-profile', {
                 headers: {
                      'Authorization': `Bearer ${token}`
                  }
                 });
                if(!response.ok){
                    throw new Error("Could not get business profile");
                }
                const data = await response.json();
                setBusinessId(data.business_profile.id)

            } catch (err) {
               setError(err.message)
            }
       }
       fetchBusinessId();
    }, []);


    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
         const token = localStorage.getItem('token');
        if(!token){
           setError("You are not logged in, please login");
          return;
        }
         if (!businessId) {
             setError("Business id not found");
             return;
         }
        try {
             const response = await fetch(`http://localhost:8000/api/chat/${businessId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                  body: JSON.stringify({ message: query }),
            });
             const data = await response.json();
            if (!response.ok) {
               throw new Error(data.detail || 'Failed to process the query');
            }
            setResponse(data.response);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
         <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Chat With Our AI Assistant</h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                 {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enter your query</label>
                    <input
                         type="text"
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                         value={query}
                        onChange={handleQueryChange}
                        required
                     />
                </div>
                <div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
                    >
                        Ask AI
                    </button>
                </div>
             {response && (
                <div className="mt-4 p-4 rounded-md bg-gray-100">
                <p className="text-gray-700">AI Assistant: {response}</p>
              </div>
             )}
            </form>
        </div>
    );
};

export default ChatbotWidget;