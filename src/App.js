import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import EmailVerify from "./components/EmailVerify"; 
import ProfileView from './components/profileview'; 
import EditBusinessProfile from './components/EditBusinessProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/verify" element={<EmailVerify />} />
        <Route path="/profile" element={<ProfileView />} /> 
        <Route path="/edit-profile" element={<EditBusinessProfile />} /> {/* Add EditBusinessProfile route */}
  
      </Routes>
    </Router>
  );
}

export default App;