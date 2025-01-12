import React, { useState, useEffect, useRef } from 'react';
import "./Post-process.css";
import Footer from "../Home/Footer";
import Grid from "../../Grid";
import Defaultbars from './Defaultbars';
import { db, storage, auth } from '../../firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaUpload, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 
import remarkGfm from "remark-gfm";
import ReactMarkdown from 'react-markdown';

function Postprocess() {
    const vid = {
        vid1: "Gradient 2.mp4",
        post: "post-process.png",
    };

    const [images, setImages] = useState([]);
    const [goal, setGoal] = useState('');
    const [response, setResponse] = useState('');
    const [analysisType, setAnalysisType] = useState('');
    const [detailLevel, setDetailLevel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const responseContainerRef = useRef(null);
    const [projectId, setProjectId] = useState('')
    const [title, setTitle] = useState('')

     // Authentication and user setup
      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user);
            try {
              const userDocRef = doc(db, "users", user.uid);
              const userDocSnap = await getDoc(userDocRef);
    
              if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                  uid: user.uid,
                  email: user.email,
                  createdAt: new Date(),
                  isSubscribed: false, 
                  metadata: { 
                    tags: [],
                    status: 'draft'
                  }
                });
              }
            } catch (error) {
              console.error('Error saving user data to Firestore:', error);
            }
          } else {
            navigate('/authentication');
          }
        });
        return () => unsubscribe();
      }, [navigate]);
    
      useEffect(() => {
        if (response && responseContainerRef.current) {
          responseContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, [response]);
    

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages((prevImages) => [...prevImages, ...files]);
    };

    const handleDeleteImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleDetailLevelChange = (e) => {
        const value = e.target.value;
        setDetailLevel((prevDetailLevel) =>
            prevDetailLevel.includes(value)
                ? prevDetailLevel.filter((level) => level !== value)
                : [...prevDetailLevel, value]
        );
    };


     // Error handling function
  const handleError = (error) => {
    let errorMessage;

    if (error.status === 400) {
      errorMessage = error?.response?.data?.message || 'Bad Request'
    } else if (error.response) {
      errorMessage = error.response.data.error || 'Server error occurred';
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      errorMessage = 'Network error - please check your connection';
      console.error('Network error:', error.request);
    } else {
      const [errorType, errorDesc] = error.message.split(':');
      const errorMessages = {
        'VALIDATION_ERROR': errorDesc,
        'AUTH_ERROR': 'Please log in again to continue',
        'USER_ERROR': 'User profile not found. Please try logging out and back in',
        'SUBSCRIPTION_ERROR': 'Please upgrade your subscription to continue',
        'FILE_SIZE_ERROR': errorDesc,
        'API_ERROR': 'Server processing failed. Please try again later',
        'NETWORK_ERROR': 'Connection failed. Please check your internet connection'
      };
      errorMessage = errorMessages[errorType] || errorDesc || 'An unexpected error occurred';
    }
    
    alert(errorMessage);
  };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!user) {
            alert('User is not authenticated. Please log in.');
            setLoading(false);
            navigate('/authentication');
            return;
          }

          try {
            // Input validation
            const validationErrors = [];
            if (!title?.trim()) validationErrors.push('title is required');
            if (!goal?.trim()) validationErrors.push('Description is required');
            if (!detailLevel?.length) validationErrors.push('At least one detail level must be selected');
            if (!analysisType) validationErrors.push('Analysis type is required');
            if (!images?.length) validationErrors.push('At least one image is required');
            if (validationErrors.length > 0) {
                throw new Error('VALIDATION_ERROR:' + validationErrors.join(', '));
            }


        // User and subscription validation
              const userDocRef = doc(db, "users", user.uid);
        
              const userDocSnap = await getDoc(userDocRef);
        
              if (!userDocSnap.exists()) {
                throw new Error('USER_ERROR:User profile not found');
              }
        
              const userData = userDocSnap.data();
              if (!userData.isSubscribed) {
                throw new Error('SUBSCRIPTION_ERROR:Please upgrade to continue');
              }
        
              // Form data preparation with validation
              const formData = new FormData();
              const maxFileSize = 5 * 1024 * 1024; 
        
              for (const image of images) {
                if (image.size > maxFileSize) {
                  throw new Error(`FILE_SIZE_ERROR:${image.name} exceeds 5MB limit`);
                }
                formData.append('images', image);
              }

               // Append validated form data
                formData.append('description', goal.trim());
                formData.append('analysisType', analysisType);
                formData.append('detailLevel', detailLevel.join(','));
                formData.append('userId', user.uid);
                formData.append('title', title.trim());
        

               // Get fresh ID token and make API request
            const idToken = await user.getIdToken(true);
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

                const response = await axios({
                method: 'POST', 
                url: `${apiUrl}/postprocess`, 
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${idToken}`
                },
                timeout: 300000,
                });

                setLoading(true);

        
                const { id, generatedResponse } = response.data;
                
                if (!id || !generatedResponse) {
                throw new Error('API_ERROR:Invalid response from server');
                }

                setProjectId(id)
                
                // Success handling
                resetForm();
                setResponse(generatedResponse.content);
            
        
            } catch (error) {
            if (error.response?.status === 500) {
                console.error('Server Error:', error.response.data);
            } else {
                console.error('Request Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
                });
            }
            handleError(error);
            } finally {
            setLoading(false);
            }
        };

         // Form reset handler
        const resetForm = () => {
            setImages([]);
            setGoal('');
            setAnalysisType('');
            setDetailLevel([]);
        };

                
      // PDF generation handler 
        const generatePDF = async () => {
          if (!user) {
            alert('Please log in to generate a report');
            return;
          }
        
          if (!response) {
            alert('No data available to generate a report');
            return;
          }
        
          const maxFileSize = 5 * 1024 * 1024;
        
          try {
            // Validate and append images
            for (const image of images) {
              if (image.size > maxFileSize) {
                alert(`${image.name} exceeds the 5MB limit.`);
                return;
              }
            }
        
            // Initialize jsPDF
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
            const formattedResponse = response.replace(/(\*\*|##)/g, ''); 
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
        
            // Automatically download the PDF
            const link = document.createElement('a');
            link.href = pdfURL;
            link.download = fileName;
            link.click();

            //update project in database with pdfUrl
            const docReference = doc(db, `projects/${user.uid}/subcollection/${projectId}`);
            const docSnapshot = await getDoc(docReference); 
            if (docSnapshot.exists()) {
              await updateDoc(docReference, {
                reportUrl: pdfURL
              })
              
            } 
        
            return pdfURL;
          } catch (error) {
            console.error('Error generating or uploading PDF:', error);
            alert(`Failed to generate report: ${error.message}`);
          }
  };


    return (
        <div id='err1'>
            <video id="background-video"
                src={vid.vid1}       
                alt = "background video"
                loop 
                autoPlay 
                muted 
                playsInline
            >
            </video>
            <Grid/>
            <Defaultbars/>
            <div className='current'>
                <div><img src={vid.post} alt="Post-process" /></div>
                <h2>Clarity & Accuracy For Post-Processing</h2>
            </div>
            <div className="errorcheck">
                <form onSubmit={handleSubmit} className="image-form">
                 <div className="form-group">
                      <label htmlFor="title" id='topspace'>Provide a Unique Project Title:</label>
                      <input
                        type='text'
                        id="titles"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Provide a unique title for your project.'
                        required
                      />
                    </div>
                    <div className="form-group">
                        <label htmlFor="imageUpload">Upload Images/Plots of Your Outcomes for Interpretation:</label>
                        <div className="custom-file-upload">
                            <label htmlFor="imageUpload" id='hov'>
                                <FaUpload size={30} />
                            </label>
                            <input
                                type="file"
                                id="imageUpload"
                                onChange={handleImageChange}
                                multiple
                                accept=".jpg,.jpeg,.png,.mp4,.pdf"
                                style={{ display: 'none' }}
                                required
                            />
                        </div>
                    </div>
                    <div className="uploaded-images">
                        {images.map((image, index) => (
                            <div key={index} className="image-preview">
                                <img src={URL.createObjectURL(image)} alt={`preview-${index}`} />
                                <button type="button" onClick={() => handleDeleteImage(index)} id='buts'>
                                    <FaTrashAlt />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="form-group">
                        <label htmlFor="analysisType">Select Analysis Type:</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    value="FEA"
                                    checked={analysisType === 'FEA'}
                                    onChange={(e) => setAnalysisType(e.target.value)}
                                />
                                FEA
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="CFD"
                                    checked={analysisType === 'CFD'}
                                    onChange={(e) => setAnalysisType(e.target.value)}
                                />
                                CFD
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Provide the materials used for your FEA/CFD Analysis: </label>
                        <textarea
                            id="description"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder='Please provide all the materials used for your specific FEA/CFD analysis from pre-processing...'
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="detailLevel">What level of details do you require in the explanation?</label>
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    value="High Student-level insight"
                                    checked={detailLevel.includes('High Student-level insight')}
                                    onChange={handleDetailLevelChange}
                                />
                                High Student Level
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="Detailed technical insight"
                                    checked={detailLevel.includes('Detailed technical insight')}
                                    onChange={handleDetailLevelChange}
                                />
                                Detailed Technical Insight
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="Marketing-level insight"
                                    checked={detailLevel.includes('Marketing-level insight')}
                                    onChange={handleDetailLevelChange}
                                />
                                Marketing Level
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="Research-level insight"
                                    checked={detailLevel.includes('Research-level insight')}
                                    onChange={handleDetailLevelChange}
                                />
                                Research Level 
                            </label>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} id='newbut'>
                        {loading ? 'Generating...' : 'Generate Clarity'}
                    </button>
                </form>
            </div>
             <div className="response-container" ref={responseContainerRef}>
                    {loading ? (
                      <div style={{ width: '100%', height: '5px', background: '#ddd' }}>
                        <div
                          style={{
                            width: '50%',
                            height: '100%',
                            background: '#3498db',
                            animation: 'loadingBar 1s linear infinite',
                          }}
                        ></div>
                      </div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="response">
                        {response || 'No response yet. Click "Generate Clarity" '}
                      </ReactMarkdown>
                    )}
            
                    {!loading && (
                      <button className="report" onClick={generatePDF}>
                        Generate Report
                      </button>
                    )}
            
                    {/* Loading bar animation */}
                    <style>
                      {`
                        @keyframes loadingBar {
                          0% { transform: translateX(-100%); }
                          100% { transform: translateX(100%); }
                        }
                      `}
                    </style>
                  </div>
            <Footer />
        </div>
    );
}

export default Postprocess;
