import React, { useEffect, useState } from 'react';
import './Projects.css';
import { db, auth } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Footer from '../Home/Footer';
import Navbar from '../Home/Navbar';
import DeleteIcon from "@mui/icons-material/Delete";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate('/authentication');
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
        const projectSnapshot = await getDocs(collection(db, `projects/${user.uid}/subcollection`));
        console.log(projectSnapshot)
        const items = projectSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(items)
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (loading) {
    return <div id="load">Loading...</div>;
  }

  if (projects.length === 0) {
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

    const handleDelete = async (id) => {
      //display prompt to confirm delete first before proceeding
      

      //delete project from firebase
      try {
        const docRef = doc(db, `projects/${user.uid}/subcollection/${id}`);
        await deleteDoc(docRef);
        setProjects(projects.filter(x => x.id !== id));
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    };

  return (
    <>
    <video id="background-video"
          src={vid.vid1} controls loop autoPlay muted>
    </video>
      <Navbar />
      <div className="project-details">
      <h1>Your Reports</h1>
      <ul className="reports-list">
        {projects.map((item) => (
          <li key={item.id} className="report-item">
            <h2>{item.title}</h2>
            <p>Description: {item.description}</p>
            <Link to={item.reportUrl} target="_blank">
              Download Report
            </Link>
            <button
              className="delete-btn"
              onClick={() => handleDelete(item.id)}
              aria-label="Delete Report"
            >
              <DeleteIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
      <Footer />
    </>
  );
}

export default Projects;
