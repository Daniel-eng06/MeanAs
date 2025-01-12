import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Grid from '../../Grid';
import Footer from '../Home/Footer';
import Navbar from "../Home/Navbar.jsx";
import Section6 from "../Home/Section6";
import './TeamConnect.css';
import { onAuthStateChanged } from 'firebase/auth';

function TeamConnect() {
    const vids = {
        vid1s: 'Gradient 2.mp4',
    };

    const [projects, setProjects] = useState([]);
    const [emailMessage, setEmailMessage] = useState('');
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [user, setUser] = useState(null);

    // Track authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch projects from Firestore
    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) return;
            try {
                const projectSnapshot = await getDocs(collection(db, `projects/${user.uid}/subcollection`));
                const items = projectSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProjects(items);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, [user]);

    // Update the selected project when the dropdown changes
    const handleProjectSelection = (e) => {
        const selectedId = e.target.value;
        const project = projects.find(p => p.id === selectedId);
        if (project) {
            setSelectedProject(project);
        }
        console.log('Selected Project:', project);
    };

    // Function to share via email
    const shareViaEmail = (message, reportURL) => {
        window.location.href = `mailto:?subject=Project Report&body=${encodeURIComponent(message)}%0D%0A${encodeURIComponent(reportURL)}`;
    };

    // Function to share via WhatsApp
    const shareViaWhatsApp = (message, reportURL) => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + "\n" + reportURL)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div id='allteam'>
            <Grid />
            <video id="background-video" src={vids.vid1s}
                alt="background video"
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
                        <select defaultValue={''} onChange={(e) => handleProjectSelection(e)}>
                            <option value='' disabled>Select a project</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.title}
                                </option>
                            ))}
                        </select>
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
                            if (!selectedProject) {
                                alert('Please select a project first.');
                                return;
                            }
                            if (!selectedProject.reportURL) {
                                alert('This project does not have a report URL.');
                                return;
                            }
                            shareViaEmail(emailMessage, selectedProject.reportURL);
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
                            if (!selectedProject) {
                                alert('Please select a project first.');
                                return;
                            }
                            if (!selectedProject.reportURL) {
                                alert('This project does not have a report URL.');
                                return;
                            }
                            shareViaWhatsApp(whatsappMessage, selectedProject.reportURL);
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
