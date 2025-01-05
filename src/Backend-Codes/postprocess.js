const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const { firestore, storage } = require('../../firebase.js');

dotenv.config();

const router = express.Router();


// Set up multer for handling file uploads
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

  console.log(images);

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
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`  
      }
    });

  return response.data;
} 

// Endpoint to handle data processing
router.post('/', upload.array('images'), async (req, res) => {
  try {
    const { description, analysisType, detailLevel, userId} = req.body;
    const files = req.files;

    // Validate required fields
    if (!description) {
      return res.status(400).json({ error: 'Invalid Description' });
    }
    
    if (!analysisType) {
      return res.status(400).json({ error: 'Invalid Analysis Type' });
    }
    
    if (!detailLevel) {
      return res.status(400).json({ error: 'Invalid Detail Level' });
    }
  
    if (!files) {
      return res.status(400).json({ error: 'No images uploaded' });
    }


    // Save data to Firestore
    const data = {
      description,
      analysisType,
      detailLevel,
      timestamp: new Date(),
      projectType: 'POST_PROCESS',
      userId,
    };
   

    const projectRef = await firestore.collection(`projects/${data.userId}/subcollection`).add(data);
    // In your backend
    if (!projectRef || !projectRef.id) {
      throw new Error('Project reference not created properly');
    }
    const validImageUrls = [];

    for (const file of files) {
      try {
        const fileName = `uploads/${data.userId}/${Date.now()}_${file.originalname}`;
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

    const requirement = ` 
            1. FEA Results Interpretation:
              - Analyze either the stress, strain and deformation distributions obtained from the FEA analysis in the provided visualized result images in a sentence.
              - Identify key areas that one must look out for in one sentence, such as regions with high stress concentrations or significant deformation.
              - Compare the analyzed yield strength values from the FEA results with the standard yield strength of the ${description} used.
              - Provide a detailed interpretation of these results, explaining how they align with the objectives of the FEA study.
            
            2. Material Performance Evaluation:
              - Check the image and spot out the performance of the selected material under the simulated FEA conditions.
              - Now Compare the standard yield strength values of the ${description} with the analyzed final stress, deformation value or strain value from the visualized FEA results image.
              - Assess whether the materials meet the expected performance criteria based on the FEA results, and suggest any necessary material changes and future steps to take to succeed.
            
            3. FEA Results Comparison and Validation:
              - Search into your trained data and knowledge you have concerning FEA results and judge if this model is good for manufacturing or to perform it's purpose.
              - Inform me on any discrepancies between the FEA results and these other data sources, providing potential reasons for any differences.
              - if the results isn't good then recommend what must be done right and any additional simulations or model adjustments that could improve the accuracy of the FEA results."
          `   
          
    const Cfd_request = ` 
      1. CFD Results Interpretation:
        - Analyze the fluid flow patterns and other relevant results obtained from the CFD analysis in the provided visualized images.
        - Identify key areas of interest, such as regions with high turbulence, pressure drops, or flow separations.
        - Compare the analyzed results with any theoretical or experimental data if available.
        - Provide a detailed interpretation of these results, explaining how they align with the objectives of the CFD study.

      2. Material and Boundary Condition Evaluation:
        - Check the image and spot out the performance of the materials and boundary conditions used in the CFD analysis.
        - Assess how the boundary conditions affect the fluid flow and heat transfer results.
        - Suggest any necessary changes to the boundary conditions or materials based on the CFD results.
      
      3. CFD Results Comparison and Validation:
        - Search into your trained data and knowledge you have concerning CFD results and judge if this model is good for manufacturing or to perform it's purpose.
        - Inform me on any discrepancies and provide potential reasons for differences.
        - Recommend any additional simulations or model adjustments that could improve the accuracy of the CFD results.`      

    // Create the prompt text based on the analysis type
    let promptText;
    if (analysisType === 'FEA') {
      promptText = `
      Role: As a CAE expert, Senior Engineer in all engineering fields, and physicist with extensive knowledge in Finite Element Analysis (FEA), your task involves post-processing the FEA results of the provided model.
      
      Task: In three solid reasoning provide a grade 5 understanding to the results in the image.
      
     Title: ${detailLevel} Level Explanation:
         - Create a clear and concise report compiling the final FEA report using this detail level: ${detailLevel}.
         if(${detailLevel} === 'High Student Level'){
            Provide the explanation and final report according to the specified detail level:
           - High Student Level: Simplify the explanation with basic terminology and illustrative examples, suitable for individuals with a limited background in engineering.
             ${requirement}
         })
           })
           elseif(${detailLevel} === 'Detailed Technical Insight'){
           Provide the explanation and final report according to the specified detail level:
           - Detailed Technical Insight: Offer an in-depth analysis with technical details, including mathematical formulations and thorough discussions, addressing specific technical questions.
             ${requirement}
           })
           elseif(${detailLevel} === 'Marketing Level'){
           Provide the explanation and final report according to the specified detail level:
           - Marketing Level: Highlight the key benefits and real-world applications of the FEA results, using persuasive language to emphasize the impact and relevance.
             ${requirement}
           })
          elseif(${detailLevel} === 'Research Level'){
          Provide the explanation and final report according to the specified detail level:
           - Research Level: Deliver a comprehensive, scholarly report with advanced technical details, theoretical background, and references to relevant research, supporting a deep understanding of the results.
           ${requirement}
           })
          else{no response}
           `;

    } else if (analysisType === 'CFD') {
      promptText = `
      Role: As a CAE expert, Senior Engineer in all engineering fields, and physicist with extensive knowledge in Computational Fluid Dynamics (CFD), your task involves post-processing the CFD results of the provided model.

      Task: With this as my ${description}  Bolden the key factors:

      Title: ${detailLevel} Level Explanation:
         - Create a clear and concise report compiling the final FEA report using this detail level: ${detailLevel}.
         if(${detailLevel} === 'High Student Level'){
            Provide the explanation and final report according to the specified detail level:
           - High Student Level: Simplify the explanation with basic terminology and illustrative examples, suitable for individuals with a limited background in engineering.
             ${Cfd_request}
         })
           })
           elseif(${detailLevel} === 'Detailed Technical Insight'){
           Provide the explanation and final report according to the specified detail level:
           - Detailed Technical Insight: Offer an in-depth analysis with technical details, including mathematical formulations and thorough discussions, addressing specific technical questions.
            ${Cfd_request}
           })
           elseif(${detailLevel} === 'Marketing Level'){
           Provide the explanation and final report according to the specified detail level:
           - Marketing Level: Highlight the key benefits and real-world applications of the FEA results, using persuasive language to emphasize the impact and relevance.
            ${Cfd_request}
           })
          elseif(${detailLevel} === 'Research Level'){
          Provide the explanation and final report according to the specified detail level:
           - Research Level: Deliver a comprehensive, scholarly report with advanced technical details, theoretical background, and references to relevant research, supporting a deep understanding of the results.
            ${Cfd_request}
           })
          else{no response}
           `;

    } else {
      promptText = `
      Please specify a valid analysis type (e.g., FEA or CFD) and provide the necessary details for the analysis.  Bolden the key factors
      - Analysis Type: Choose between FEA or CFD.
      - Description: Provide a brief description of the analysis.
      - Materials: Specify the materials used in the analysis.
      - Detail Level: Indicate the level of detail required for the final report (e.g., High Student Level, Detailed Technical Insight, Marketing Level, Research Level).
      - Option: Specify any specific options or custom settings for the analysis.
      - Custom Option: Provide any additional custom details relevant to the analysis.
  
      Ensure all required fields are completed for accurate and effective analysis.
      `;
    }

    // Call callGPTAPI to process images and the prompt
        const gptResponse = await callGPTAPI(validImageUrls, promptText);
        const generatedResponse = gptResponse['choices'][0]['message']
    
        // Save the generated response to Firestore
        await projectRef.update({
          generatedResponse,
          responseGeneratedAt: new Date(),
        });
      
    
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