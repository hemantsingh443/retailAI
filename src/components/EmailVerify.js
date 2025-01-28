import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

const EmailVerify = () => {
    const { code } = useParams();
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

     useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/verify?code=${code}`);
                const data = await response.json();
                 setMessage(data.message);
                 setTimeout(()=> {
                    navigate("/");
                 }, 3000);
            } catch (error) {
               setMessage("Failed to verify email, please try again");
            }
        };
       verifyEmail();
     }, [code, navigate]);

    return(
         <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                   {message}
                   </h2>
                </div>
          </div>
       </div>
    );

}

export default EmailVerify;