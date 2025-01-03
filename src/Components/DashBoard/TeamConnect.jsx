import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import Grid from '../../Grid';
import Footer from '../Home/Footer';
import Navbar from "../Home/Navbar.jsx";
import Section6 from "../Home/Section6";
import './TeamConnect.css';

function TeamConnect() {
    const vids = {
        vid1s: 'Gradient 2.mp4',
    };

    const [projects, setProjects] = useState([]);
    const [emailMessage, setEmailMessage] = useState('');
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [userId, setUserId] = useState(null);

    // Track authentication state
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch projects from Firestore
    useEffect(() => {
        const fetchProjects = async () => {
            if (userId) {
                try {
                    const q = query(collection(db, "reports"), where("userId", "==", userId));
                    const querySnapshot = await getDocs(q);
                    const userProjects = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        reportURL: `https://storage.googleapis.com/${process.env.REACT_APP_STORAGE_BUCKET}/reports/${doc.data().userId}/${doc.data().fileName}`
                    }));
                    setProjects(userProjects);
                } catch (error) {
                    console.error("Error fetching projects:", error);
                    alert("An error occurred while fetching your projects. Please try again.");
                }
            }
        };

        fetchProjects();
    }, [userId]);

    const shareViaEmail = (message, reportURL) => {
        window.location.href = `mailto:?subject=Project Report&body=${encodeURIComponent(message)}%0D%0A${encodeURIComponent(reportURL)}`;
    };

    const shareViaWhatsApp = (message, reportURL) => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + "\n" + reportURL)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div id='allteam'>
            <Grid />
            <video id="background-video" src={vids.vid1s}      
              alt = "background video"
              loop 
              autoPlay 
              muted 
              playsInline
            ></video>
            <Navbar />
            <div className='teamhub'>
                <div>
                    <h1>Share your projects with your Team and Friends</h1>
                </div>
                <h2>Projects currently worked on:</h2>
                <div className='borderteam'>
                    {/* Checking if the user has any projects */}
                    {projects.length === 0 ? (
                        <p>You currently have no projects. Please explore the features of MeanAs on your dashboard. Thank you!</p>
                    ) : (
                        projects.map(project => (
                            <div key={project.id} onClick={() => setSelectedProject(project)}>
                                <h3>{project.title}</h3>
                                <p>{project.description}</p>
                                <a href={project.reportURL} target="_blank" rel="noopener noreferrer">View Report</a>
                            </div>
                        ))
                    )}
                </div>
                <div className="sharing-container">
                    <div className="sharing-section">
                        <label>Share via Email</label>
                        <textarea
                            type='text'
                            placeholder='Add a message to convey clarity to your team and friends.'
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            required
                        />
                        <button className='share-button' onClick={() => {
                            if (selectedProject) {
                                shareViaEmail(emailMessage, selectedProject.reportURL);
                            } else {
                                alert('Please select a project first.');
                            }
                        }}>
                            Send
                        </button>
                    </div>
                    <div className="sharing-section">
                        <label>Share via WhatsApp</label>
                        <textarea
                            type='text'
                            placeholder='Add a message to convey clarity to your team and friends.'
                            value={whatsappMessage}
                            onChange={(e) => setWhatsappMessage(e.target.value)}
                            required
                        />
                        <button className='share-button' onClick={() => {
                            if (selectedProject) {
                                shareViaWhatsApp(whatsappMessage, selectedProject.reportURL);
                            } else {
                                alert('Please select a project first.');
                            }
                        }}>
                            Send
                        </button>
                    </div>
                </div>
                <div>
                    <p>Thank you for choosing MeanAs for clarity, confidence, and accurate interpretations of your projects.
                         We appreciate your support and invite you to share your experiences with us below.</p>
                </div>
            </div>
            <Section6 />
            <Footer />
        </div>
    );
}

export default TeamConnect;
