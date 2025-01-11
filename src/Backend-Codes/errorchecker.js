const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const { firestore, storage } = require('../../firebase.js');

dotenv.config();

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });


// Function to make an API call to Claude
async function callGPTAPI(imageUrls, promptText) {
  const systemPrompt = `You are a CAE expert, Senior Engineer in all engineering fields, and physicist with extensive knowledge in all kinds of analysis under FEA/CFD. 
  You are assigned to analyze the provided images and information carefully, ensuring your responses are detailed, technical, and actionable. You should:
1. Focus on practical implementation details
2. Provide numerical values and specific recommendations
3. Highlight critical aspects of the analysis
4. Explain your reasoning for each recommendation
5. Consider both theoretical principles and practical limitations
6. Maintain professional engineering terminology throughout your response
7. Be able to think and reason about the correct and accurate answer before delivering`;

   const images =  imageUrls.map(url => ({
    type: 'image_url',
    image_url: {
      url,
    }
  }))

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${systemPrompt}\n\n${promptText}`
          },
          ...images,
        ]
      },
    ];

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-2024-05-13",  
      messages: messages,
      temperature: 0.3, 
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1,
      max_tokens: 3000,
      //this metrics affect the performance of the results.
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`  
      }
    });

  return response.data;
} 


// Endpoint to handle error-checking data
router.post('/', upload.array('images'), async (req, res) => {
  try {
    const { description, analysisType, title} = req.body;
    const files = req.files;
    const userId = req.user.uid;
  
    // Validate input data
    if (!description ) {
      return res.status(400).json({ error: 'Invalid Description' });
    }

    if (!title ) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!analysisType) {
      return res.status(400).json({ error: 'Invalid Analysis Type' });
    }

    if (!files) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const userSubscriptions = await firestore.collection("userSubscriptions")
      .where("user.uid", "==", userId)
      .where("active", "==", true)
      .get();

    if (userSubscriptions.empty) {
      return res.status(400).json({ message: "Sorry you don't have any subscriptions at the moment. Please explore our subscriptions to continue" });
    }

    const userSubscriptionDoc = userSubscriptions.docs[0];

    const userSubscriptionUsage = await firestore.collection("userSubscriptionUsage")
      .where("userId", "==", userId)
      .where("userSubscription.id", "==", userSubscriptionDoc.id)
      .get();

    if (!userSubscriptionUsage.empty && userSubscriptionUsage.docs[0].data().limit === 0) {
      return res.status(400).json({ message: "Sorry you have exhausted your current subscription. Please navigate to the pricing page to upgrade." });
    }


  // Save data to Firestore
  const data =  {
    description,
    analysisType,
    timestamp: new Date(),
    userId,
    projectType: 'ERROR_CHECKER',
    title
  };

  const projectRef = await firestore.collection(`projects/${data.userId}/subcollection`).add(data);
  // In your backend
  if (!projectRef || !projectRef.id) {
    throw new Error('Project reference not created properly');
  }
  const validImageUrls = [];

  for (const file of files) {
    try {
      const fileName =  `uploads/${data.userId}/${Date.now()}_${file.originalname}`;
      const upload = storage.file(fileName);

      await upload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
      await upload.makePublic();

        validImageUrls.push(`https://storage.googleapis.com/${storage.name}/${upload.name}`);
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError);
    }
  }

  // Prompt text based
  const promptText = 
  `
   #Task:Please help me accurately and avoid hallucination. Spot out why and how to solve the error in the image provided and the model with the software ${analysisType} for my goal: ${description}.
    elaborate on  the solution within 3 solid bullet points with realistic solutions related to the model, error and implementable numerical values 
    that could be used at important stages during the analysis process to assist in obtaining quality and accurate results. I trust you will deliver the best solutions.
    
    Your output should be in a way that both a non-engineering & engineering student, business man, company 
    or any other firm could understand and follow till a clear successful analysis solution. 
    
    Instructions: *Bolden* the key factors and be clear, brainstorm and concise.
    `;

    // Call callGPTAPI to process images and the prompt
      const gptResponse = await callGPTAPI(validImageUrls, promptText);
      const generatedResponse = gptResponse['choices'][0]['message']
  
      // Save the generated response to Firestore
      await projectRef.update({
        generatedResponse,
        responseGeneratedAt: new Date(),
      });

      await firestore.collection(`tmpSubscriptionUsage`).add({userId});
    
      res.status(200).json({
        id: projectRef.id, 
        generatedResponse: generatedResponse 
      });
    } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({ error: error.message || 'Failed to process data' });
    }
  });
    
module.exports = router;