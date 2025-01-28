import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, Home, BarChart3, Send, ArrowLeft } from 'lucide-react';
import BusinessForm from "./BusinessForm";

export const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasBusiness, setHasBusiness] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [analysisData, setAnalysisData] = useState(null);
    const [animationClass, setAnimationClass] = useState('');
    const [chartData, setChartData] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [query, setQuery] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [businessId, setBusinessId] = useState(null);
    const chatEndRef = useRef(null);
    const navigate = useNavigate();
    const analysisInterval = useRef(null);

    // Scroll to bottom of chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const updateChartData = (analysisData) => {
        if (!analysisData) {
            setChartData(null);
            return;
        }
        const categories = analysisData.top_categories.map((item) => item.category);
        const counts = analysisData.top_categories.map((item) => item.count);
        setChartData({
            labels: categories,
            datasets: [
                {
                    label: "Query Count",
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                },
            ],
        });
    };

    const fetchAnalysisData = async (token) => {
        try {
            const response = await fetch('http://localhost:8000/api/user/chat-analysis', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch analysis data');
            }
            const data = await response.json();
            setAnalysisData(prevData => {
                // Animate only if data has changed
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    setAnimationClass('animate-pulse');
                    setTimeout(() => setAnimationClass(''), 1000);
                }
                return data;
            });
            updateChartData(data);
        } catch (err) {
            setError(err.message);
        }
    };


    const startAnalysisInterval = (token) => {
        if (analysisInterval.current) {
            clearInterval(analysisInterval.current);
        }
        analysisInterval.current = setInterval(() => {
            fetchAnalysisData(token);
        }, 5000);
    };


    useEffect(() => {
        const fetchUserData = async () => {
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
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data.user);
                setHasBusiness(!!data.business_profile);
                setBusinessId(data.business_profile?.id);
                if (data.business_profile) {
                    fetchAnalysisData(token);
                    startAnalysisInterval(token);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                setInitialLoad(false);
            }
        };

        fetchUserData();
        return () => {
            if (analysisInterval.current) {
                clearInterval(analysisInterval.current);
            }
        };
    }, [navigate]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const token = localStorage.getItem('token');

        const newMessage = { type: 'user', content: query };
        setChatMessages(prev => [...prev, newMessage]);
        setQuery('');
        try {
            const response = await fetch(`http://localhost:8000/api/chat/${businessId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: query }),
            });
            if (!response.ok) {
                throw new Error('Failed to process the query');
            }
            const data = await response.json();
            setChatMessages(prev => [...prev, { type: 'ai', content: data.response }]);

            // Trigger analysis update after each message
            fetchAnalysisData(token);
        } catch (err) {
            setChatMessages(prev => [...prev, { type: 'error', content: 'Failed to get response' }]);
        }
    };
    const handleBusinessCreated = async () => {
        setAnimationClass('animate-fade-in-down');
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/user/complete-profile', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setHasBusiness(!!data.business_profile);
        setBusinessId(data.business_profile?.id);
        if (data.business_profile) {
            startAnalysisInterval(token);
        }
        setTimeout(() => {
            setAnimationClass('');
        }, 500);
    };

    const renderChart = () => {
        if (!analysisData?.top_categories || analysisData.top_categories.length === 0) return null;

        const chartData = analysisData.top_categories.map(item => ({
            name: item.category,
            value: item.count
        }));

        return (
            <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl col-span-full h-72">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Category Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#4B5563' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis
                            tick={{ fill: '#4B5563' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} animationDuration={1500} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderDashboardContent = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Overview Cards */}
            <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-xl">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Business Profile</h3>
                <div className="space-y-2">
                    <p className="text-gray-600">
                        <span className="font-medium">Company:</span> {userData?.company_name}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {userData?.email}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Member Since:</span> {new Date(userData?.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Sample Statistics */}
            <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-xl">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-2xl font-bold text-indigo-600">1,234</p>
                        <p className="text-gray-600">Total Visitors (sample)</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">89%</p>
                        <p className="text-gray-600">Customer Satisfaction (sample)</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnalyticsContent = () => (
        <div className="grid grid-cols-1 gap-6">
            {analysisData && (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-3xl font-bold text-indigo-600">
                                    {analysisData.total_queries.toLocaleString()}
                                </p>
                                <p className="text-gray-600">Total Queries</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <p className="text-3xl">
                                        {analysisData.average_sentiment > 0.3 ? "😊" :
                                            analysisData.average_sentiment < -0.3 ? "😔" : "😐"}
                                    </p>
                                    <p className="text-lg text-gray-600">
                                        {analysisData.average_sentiment > 0.3 ? "Positive" :
                                            analysisData.average_sentiment < -0.3 ? "Negative" : "Neutral"}
                                    </p>
                                </div>
                                <p className="text-gray-600">Average Sentiment</p>
                            </div>
                        </div>
                    </div>
                    {renderChart()}
                </>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar - Only show when business exists */}
            {hasBusiness && (
                <div className="w-20 bg-indigo-700 flex flex-col items-center py-8 space-y-8 shadow-xl">
                    <Link to="/" className="p-2 rounded-xl text-white hover:bg-indigo-600 transition-all duration-300" title="Go to home">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex flex-col space-y-8">
                        {[
                            { icon: Home, tab: 'dashboard', label: 'Dashboard' },
                            { icon: MessageSquare, tab: 'chat', label: 'Chat' },
                            { icon: BarChart3, tab: 'analytics', label: 'Analytics' }
                        ].map(({ icon: Icon, tab, label }) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1
                                    ${activeTab === tab
                                        ? 'bg-indigo-800 text-white shadow-lg'
                                        : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'}`}
                            >
                                <Icon size={24} />
                                <span className="text-xs">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex">
                {!hasBusiness ? (
                    <div className="flex-1 p-8">
                        <BusinessForm onBusinessCreated={handleBusinessCreated} />
                    </div>
                ) : activeTab !== 'chat' ? (
                    <div className="flex-1 p-8">
                        {/* Header - Only show when business exists */}
                         <div className="mb-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    Welcome back, {userData?.company_name}
                                </h1>
                                <p className="text-gray-600">Here's what's happening with your business</p>
                            </div>
                            <Link
                                to="/profile"
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium
                                    hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                                View Profile
                           </Link>
                        </div>

                        {/* Main Content */}
                        {activeTab === 'dashboard' && renderDashboardContent()}
                        {activeTab === 'analytics' && renderAnalyticsContent()}
                    </div>
                ) : (
                    // Chat Interface
                    <div className="absolute inset-y-0 right-0 left-[80px] bg-white z-10">
                         <div className="h-screen flex flex-col">
                            <div className="p-4 border-b bg-white shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatEndRef}>
                                {chatMessages.map((message, index) => (
                                    <div key={index}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md p-3 rounded-xl ${
                                            message.type === 'user'
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : message.type === 'error'
                                                    ? 'bg-red-50 text-red-800 border border-red-100'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white shadow-sm">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 
                                        focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Type your message..."
                                    />
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700
                                        transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;