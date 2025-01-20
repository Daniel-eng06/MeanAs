import React, { useEffect, useState } from 'react';
import './Projects.css';
import { db, auth, storage } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Footer from '../Home/Footer';
import Navbar from '../Home/Navbar';
import DeleteIcon from '@mui/icons-material/Delete';
import { jsPDF } from 'jspdf';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
        const items = projectSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(items);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (loading) {
    return <div id="loadi">Loading...</div>;
  }

  if (projects.length === 0) {
    const vid = {
      vid1: 'Gradient 2.mp4',
    };
    return (
      <div id="loader">
        <video
          id="background-video"
          src={vid.vid1}
          alt="background video"
          loop
          autoPlay
          muted
          playsInline
        ></video>
        <Navbar />
        <div id="loadi">
          <h1>No projects found from your account.</h1>
          <br />
          <span>Navigate back to your Dashboard and explore MeanAs.</span>
        </div>
        <Footer />
      </div>
    );
  }

  const vid = {
    vid1: 'Gradient 2.mp4',
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.'
    );

    if (confirmDelete) {
      try {
        const docRef = doc(db, `projects/${user.uid}/subcollection/${id}`);
        await deleteDoc(docRef);
        setProjects(projects.filter((x) => x.id !== id));
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleDownloadReport = async (item) => {
    if (item.reportUrl) {
      window.open(item.reportUrl, '_blank');
      return;
    }

    const pdfDoc = new jsPDF();
    const margin = 10;
    let yPosition = margin;
    const maxWidth = 180;  

    // Add header
    pdfDoc.setFontSize(18);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.text("Project Report", margin, yPosition);
    yPosition += 15;

    // Add a section for analysis results
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(14);
    pdfDoc.text("Analysis Results:", margin, yPosition);
    yPosition += 10;

    // Format and add response content using splitTextToSize
    pdfDoc.setFont('helvetica', 'normal');
    const formattedResponse = item.generatedResponse.content.replace(/(\*\*|##)/g, ''); 
    const responseLines = pdfDoc.splitTextToSize(formattedResponse, maxWidth);

    for (const line of responseLines) {
      if (yPosition > pdfDoc.internal.pageSize.height - margin) {
        pdfDoc.addPage();
        yPosition = margin;
      }
      pdfDoc.text(line.trim(), margin, yPosition);
      yPosition += 10;  // Adjust spacing
    }

    // Save and upload PDF
    const timestamp = new Date().toISOString();
    const fileName = `report_${timestamp}.pdf`;
    const pdfBlob = pdfDoc.output('blob');
    const pdfRef = ref(storage, `reports/${user.uid}/${fileName}`);
    await uploadBytes(pdfRef, pdfBlob);
    const pdfURL = await getDownloadURL(pdfRef);

    //update project in database with pdfUrl
    const docReference = doc(db, `projects/${user.uid}/subcollection/${item.id}`);

    const docSnapshot = await getDoc(docReference); 
    if (docSnapshot.exists()) {
      await updateDoc(docReference, {
        reportUrl: pdfURL
      })
      
    } 

    window.open(pdfURL, "_blank");

  }

  

  return (
    <div className="proj">
      <video id="background-video" src={vid.vid1} controls loop autoPlay muted></video>
      <Navbar />
      <div className="project-details">
        <h1>Your Reports</h1>
        <ul className="reports-list">
          {projects.map((item) => (
            <li key={item.id} className="report-item">
              <h2>{item.title}</h2>
              <p>Description: {item.description}</p>
              <div className='download'>
                <button onClick={() => handleDownloadReport(item)} className='repbut'>Download Report</button>
                
                {/* <Link to={item.reportUrl} target="_blank" rel="noopener noreferrer" className='repbut'>
                  
                </Link> */}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete Report"
                >
                  <DeleteIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </div>
  );
}

export default Projects;
