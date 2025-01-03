import React, { useEffect, useState } from 'react';
import './Projects.css';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Footer from '../Home/Footer';
import Navbar from '../Home/Navbar';

function Projects() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate('/authentication'); // Redirect to Authentication if not logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch reports for the logged-in user
  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
      setLoading(true);
      try {
        const reportsRef = collection(db, 'reports');
        const q = query(reportsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const userReports = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReports(userReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (loading) {
    return <div id="load">Loading...</div>;
  }

  if (reports.length === 0) {
    const vid ={
      vid1:"Gradient 2.mp4"
  }
    return <div id="loader">
              <video id="background-video"
                  src={vid.vid1}       
                  alt = "background video"
                  loop 
                  autoPlay 
                  muted 
                  playsInline
              >
              </video>
             <Navbar/>
             <div id="loadi">
                <h1>No projects found from your account.</h1><br />
                <span>Navigate back to your Dashboard and explore MeanAs.</span>
              </div>
            <Footer />
          </div>
  }
    const vid ={
      vid1:"Gradient 2.mp4"
    }

  return (
    <>
    <video id="background-video"
          src={vid.vid1} controls loop autoPlay muted>
    </video>
      <Navbar />
      <div className="project-details">
        <h1>Your Reports</h1>
        <ul className="reports-list">
          {reports.map((report) => (
            <li key={report.id} className="report-item">
              <h2>{report.title}</h2>
              <p>Description: {report.description}</p>
              <a href={`https://storage.googleapis.com/${process.env.REACT_APP_STORAGE_BUCKET}/reports/${report.userId}/${report.fileName}`} target="_blank" rel="noopener noreferrer">
                Download Report
              </a>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
}

export default Projects;
