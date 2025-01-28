import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, MessageSquare, Store, Zap, Code, Settings, BarChart, Star, Users, Shield, User, Trash, Send } from 'lucide-react';
import Login from './Login';
import Register from './Register';


const DemoChatMessage = ({ message, isUser, isTyping, id }) => (
    <div key={id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
        <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isUser ? 'bg-indigo-600' : 'bg-gray-200'
            }`}>
                <User className={`w-5 h-5 ${isUser ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div className={`rounded-2xl p-4 max-w-xs ${
                isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none'
            } shadow-md transform hover:scale-102 transition-transform duration-200`}>
                {isTyping ? (
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                ) : (
                    <p className="text-sm">{message}</p>
                )}
            </div>
        </div>
    </div>
);

const StatCard = ({ number, label, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center space-x-4">
            <div className="bg-indigo-50 p-3 rounded-lg">
                {icon}
            </div>
            <div>
                <div className="text-3xl font-bold text-indigo-600 mb-1">{number}</div>
                <div className="text-gray-600 text-sm">{label}</div>
            </div>
        </div>
    </div>
);

const LandingPage = () => {
    const [demoMessages, setDemoMessages] = useState([
        { text: "👋 Hi! How can I help you today?", isUser: false, id: 1 },
        { text: "What are your store hours?", isUser: true, id: 2 },
        { text: "We're open Monday to Friday from 9 AM to 8 PM, and weekends from 10 AM to 6 PM! Is there anything else you'd like to know? 😊", isUser: false, id: 3 }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [generalQuery, setGeneralQuery] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [loadingUserData, setLoadingUserData] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [messageCounter, setMessageCounter] = useState(3);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [demoMessages]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoggedIn(true);
          setLoadingUserData(true);
          const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.error("Failed to fetch user data");
                    setIsLoggedIn(false);
                    localStorage.removeItem('token');
                    return;
                }

                const data = await response.json();
                setUserData(data);

            } catch (err) {
                console.error("Error fetching user data:", err);
                setIsLoggedIn(false);
                localStorage.removeItem('token');
            } finally {
               setLoadingUserData(false);
             }
            };
             fetchUserData();
        }
    }, []);


   useEffect(() => {
         const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setProfileDropdownOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
         return () => {
           document.removeEventListener('mousedown', handleClickOutside);
        }

    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserData(null);
    };


    const handleLoginSuccess = () => {
      setIsLoggedIn(true);
        setLoadingUserData(true);
      setShowLoginModal(false);
        // fetch user data here if needed after login.
         const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:8000/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.error("Failed to fetch user data");
                    setIsLoggedIn(false);
                    localStorage.removeItem('token');
                    return;
                }

                const data = await response.json();
                setUserData(data);

            } catch (err) {
                console.error("Error fetching user data:", err);
                setIsLoggedIn(false);
                localStorage.removeItem('token');
            } finally {
               setLoadingUserData(false);
             }
        };
          fetchUserData();
    };

    const handleRegisterSuccess = () => {
       setIsLoggedIn(true);
        setLoadingUserData(true);
      setShowRegisterModal(false);
        // fetch user data here if needed after registration.
           const fetchUserData = async () => {
                const token = localStorage.getItem('token');
                try {
                    const response = await fetch('http://localhost:8000/api/user/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                         console.error("Failed to fetch user data");
                        setIsLoggedIn(false);
                         localStorage.removeItem('token');
                        return;
                    }

                    const data = await response.json();
                    setUserData(data);

                } catch (err) {
                    console.error("Error fetching user data:", err);
                    setIsLoggedIn(false);
                     localStorage.removeItem('token');
                }finally {
                   setLoadingUserData(false);
                 }
             };
        fetchUserData();
    };

     const toggleProfileDropdown = () => {
        setProfileDropdownOpen(!profileDropdownOpen);
    };

    const handleDeleteAccount = async () => {
      if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:8000/api/user/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
              setUserData(null);
            } else {
              const data = await response.json();
               alert(data.detail || "Failed to delete the account");
                throw new Error(data.detail || 'Failed to delete account');
            }
        } catch (error) {
          console.log("error",error);
        }
    };

    const features = [
        {
            icon: <MessageSquare className="w-8 h-8 text-indigo-600" />,
            title: "Smart AI Responses",
            description: "Our advanced AI understands context and provides accurate, natural responses to customer queries."
        },
        {
            icon: <Zap className="w-8 h-8 text-indigo-600" />,
            title: "Lightning Fast Setup",
            description: "Get your chatbot running in under 5 minutes with our streamlined onboarding process."
        },
        {
            icon: <Code className="w-8 h-8 text-indigo-600" />,
            title: "One-Line Integration",
            description: "Add the chatbot to your website with a single line of code. No technical expertise needed."
        },
        {
            icon: <Settings className="w-8 h-8 text-indigo-600" />,
            title: "Full Customization",
            description: "Tailor the chatbot's appearance and behavior to match your brand perfectly."
        },
        {
            icon: <Shield className="w-8 h-8 text-indigo-600" />,
            title: "Enterprise Security",
            description: "Bank-grade encryption and data protection for peace of mind."
        },
        {
            icon: <BarChart className="w-8 h-8 text-indigo-600" />,
            title: "Advanced Analytics",
            description: "Gain valuable insights into customer interactions and behavior patterns."
        }
    ];

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        if (!generalQuery.trim()) return;

        setGeneralError('');
        const newMessage = { text: generalQuery, isUser: true, id: messageCounter + 1 };
        setDemoMessages(prev => [...prev, newMessage]);
        setIsTyping(true);
        setGeneralQuery('');
        setMessageCounter(prev => prev + 1);

        try {
            const response = await fetch('http://localhost:8000/api/general-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: generalQuery }),
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to process the query');
            }

            setTimeout(() => {
                setIsTyping(false);
                setDemoMessages(prev => [...prev, { 
                    text: data.response, 
                    isUser: false, 
                    id: messageCounter + 2 
                }]);
                setMessageCounter(prev => prev + 2);
            }, 1000);

        } catch (err) {
            setIsTyping(false);
            setGeneralError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        {/* Hero Section */}
            <header className="relative overflow-hidden pt-10 pb-40 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="container mx-auto px-6 relative">
                    <nav className="flex items-center justify-between py-4">
                        <Link to="/" className="text-2xl font-bold text-white">AI Chatbot</Link>
                        <div className="flex items-center space-x-4">
                           {isLoggedIn ? (
                                <>
                                    <Link to="/dashboard" className="text-white hover:text-indigo-200 transition duration-300">Dashboard</Link>
                                  {loadingUserData ? (
                                         <div className="flex items-center space-x-2">
                                                <span className="text-white font-semibold">Loading...</span>
                                           </div>
                                    ) : (
                                         <div className="relative" ref={dropdownRef}>
                                            <button onClick={toggleProfileDropdown} className="flex items-center space-x-2 focus:outline-none">
                                                <User className="w-6 h-6 text-white" />
                                                 {userData && <span className="text-white font-semibold">{userData.company_name}</span>}
                                            </button>
                                             {profileDropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10">
                                                  <button
                                                      onClick={handleDeleteAccount}
                                                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
                                                  >
                                                      <Trash className="w-4 h-4 mr-2" />
                                                      Delete Account
                                                  </button>
                                                </div>
                                             )}
                                         </div>
                                    )}


                                    <button onClick={handleLogout} className="bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                                        Logout
                                    </button>


                                </>
                           ) : (
                            <>
                              <button onClick={() => setShowLoginModal(true)} className="text-white hover:text-indigo-200 transition duration-300">Login</button>
                              <button onClick={() => setShowRegisterModal(true)}  className="bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300">Sign Up</button>

                            </>
                           )}
                         </div>
                   </nav>
                   {/* Modals */}
                    {showLoginModal && (
                       <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
                             <div className="bg-white p-6 rounded-2xl shadow-xl">
                                <Login onLogin={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />
                                 </div>
                         </div>
                     )}

                    {showRegisterModal && (
                        <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-2xl shadow-xl">
                                <Register onRegister={handleRegisterSuccess} onClose={() => setShowRegisterModal(false)}  />
                                </div>
                        </div>
                    )}
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <div className="inline-block px-4 py-2 bg-indigo-800 bg-opacity-50 rounded-full text-white text-sm mb-6">
                            ✨ AI-Powered Customer Service
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                        Transform Your <span className="text-indigo-300">Customer Support</span> with AI
                        </h1>
                        <p className="text-xl mb-8 text-indigo-100">
                        Deploy an intelligent chatbot that handles customer queries 24/7, learns from interactions, and never takes a break.
                        </p>
                        <div className="flex space-x-4">
                            <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition duration-300 shadow-lg">
                                Start Free Trial
                            </button>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition duration-300">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                     {/* Updated Demo Chat Interface */}
                    <div className="md:w-1/2">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto transform hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="text-sm text-gray-500">AI Chat Demo</div>
                            </div>
                            
                            {/* Scrollable Chat Container */}
                            <div 
                                ref={chatContainerRef}
                                className="h-96 overflow-y-auto mb-4 px-4 scroll-smooth"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#E2E8F0 #F8FAFC'
                                }}
                            >
                                {demoMessages.map((msg) => (
                                    <DemoChatMessage 
                                        key={msg.id} 
                                        message={msg.text} 
                                        isUser={msg.isUser} 
                                        id={msg.id}
                                    />
                                ))}
                                {isTyping && <DemoChatMessage isTyping={true} />}
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleGeneralSubmit} className="relative">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                                    value={generalQuery}
                                    onChange={(e) => setGeneralQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            
                            {generalError && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                    {generalError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            </header>

            {/* Stats Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <StatCard 
                            number="93%" 
                            label="Customer Satisfaction" 
                            icon={<Star className="w-6 h-6 text-indigo-600" />}
                        />
                        <StatCard 
                            number="24/7" 
                            label="Always Available" 
                            icon={<Zap className="w-6 h-6 text-indigo-600" />}
                        />
                        <StatCard 
                            number="5min" 
                            label="Setup Time" 
                            icon={<Settings className="w-6 h-6 text-indigo-600" />}
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-xl text-gray-600">Everything you need to deliver exceptional customer service</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-indigo-50 hover:border-indigo-200 transition-all duration-300">
                                <div className="bg-indigo-50 rounded-xl p-4 inline-block mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration Demo Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-50 to-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Simple Integration</h2>
                        <p className="text-xl text-gray-600">Add to your website with a single line of code</p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl">
                            <div className="flex items-center mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <code className="text-green-400">
                            &lt;script src="https://example.com/chatbot.js" id="chatbot" data-business-id="12345"&gt;&lt;/script&gt;
                            </code>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-8">Ready to Transform Your Customer Service?</h2>
                    <p className="text-xl mb-8 text-indigo-100">Join thousands of businesses already using our AI chatbot</p>
                    <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition duration-300 shadow-lg">
                        Start Free Trial
                    </button>
                    <div className="mt-8 text-indigo-200">No credit card required • 14-day free trial • Cancel anytime</div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;