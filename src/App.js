import React from 'react';
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from "./Main.jsx";
import Dashboard from "./Components/DashBoard/Dashboard";
import Preprocess from './Components/DashBoard/Pre-process.jsx';
import Errorchecker from './Components/DashBoard/Errorchecker.jsx';
import Postprocess from './Components/DashBoard/Post-Process.jsx';
import Authentication from './Components/Home/Authentication.jsx';
import Pricing from './Components/Home/Pricing.jsx';
import About from './Components/Home/About.jsx';
import Features from "./Components/Home/Features.jsx";
import Profile from "./Components/DashBoard/Profile.jsx";
import Projects from './Components/DashBoard/Projects.jsx';
import TeamConnect from './Components/DashBoard/TeamConnect.jsx';
import HelpCenter from './Components/Home/HelpCenter.jsx';
import PaymentFlow from './Components/Home/StripePayment.jsx';
import Success from './Components/Home/Success.jsx'; 

function MeanAsApp() {
  return (<div className='App'>
                <Router>
                    <Routes>
                      <Route index path="/" element={<Home/>}/>
                      <Route index path="/dashboard" element={<Dashboard/>}/>
                      <Route index path="/preprocess" element={<Preprocess/>}/>
                      <Route index path="/errorchecker" element={<Errorchecker/>}/>
                      <Route index path="/postprocess" element={<Postprocess/>}/>
                      <Route index path="/authentication" element={<Authentication/>}/>
                      <Route index path="/pricing" element={<Pricing/>}/>
                      <Route index path="/about" element={<About/>}/>
                      <Route index path="/features" element={<Features/>}/>
                      <Route index path="/profile" element={<Profile/>}/>
                      <Route index path="/projects" element={<Projects/>} />
                      <Route index path="/teamconnect" element={<TeamConnect/>}/>
                      <Route index path="/helpcenter" element={<HelpCenter/>}/>
                      <Route index path="/paymentflow/:id" element={<PaymentFlow/>}/>
                      <Route index path="/success" element={<Success />} />
                    </Routes>
                </Router>
           </div>)
}

export default MeanAsApp;

