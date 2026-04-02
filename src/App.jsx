// This is the main App component. It will contain the routes of the websites
import ApiTester from './assets/components/apitester'
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home-page";
import AboutPage from "./pages/about-page";
import ContactPage from "./pages/contact-page";

function App() {
  return (
    <>
      <ApiTester /> 
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactPage />} />
      </Routes>
    </>
  );
}

export default App;
