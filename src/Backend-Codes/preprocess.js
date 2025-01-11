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
      temperature: 0.25,
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
    const { description, mass, materials, option, customOption, analysisType, title} = req.body;
    const files = req.files;
    const user = req.user;
    const userId = user.uid;


    // Validate input data
    if (!description) {
      return res.status(400).json({ error: 'Invalid Description' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!mass) {
      return res.status(400).json({ error: 'Invalid Mass' });
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
    const data = {
      description,
      mass,
      materials: JSON.parse(materials),
      option,
      customOption,
      analysisType,
      timestamp: new Date(),
      userId,
      projectType: 'PRE_PROCESS',
      title,
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

    // prompt text based on the analysis type
    let promptText;
    if (analysisType === 'FEA') {
      promptText = `
        Task: Please help me accurately with this goal and avoid hallucination: ${description} *Bolden* the key factors and a professional format. No BS just meaningful facts. 
        
        Objective: The output should be in a way that both a non-engineering & engineering student,
        business man, company or any other firm could understand and follow till a clear successful analysis solution.
        I trust you will deliver the best solutions. 

        #Start with a Catchy Heading based on the request. 
        
        1. ##Model Analysis and Geometry Cleanup: 
          Before doing the task below I want you to be precise on the location of the model in the image that required a clean up. example at the left side of the model 
          and then you add what spot you found that must be checked.
          - Analyze the model in the provided images, tell me just the main spots to focus on for geometry cleanup.
          - Check for errors, inconsistencies, and topological issues in the image model provided and state it clearly and concise.

        2. ##Analysis Type Recommendation:
          - Recommend the specific analysis type to use to perform that aligns with the goal in my description that is define the physical behaviours that relates to the model in the image.

        3. ##Material Selection:
          - Suggest 3 materials from ${materials} that best suit my goal and select the materials from MatWeb, including full numerical properties for use specifically for my analysis.
           <example>:
            - *Stainless Steel*
              - Density: 7.85 g/cm³
              - Tensile Strength: 515-720 MPa
              - Young's Modulus: 193 GPa
              - Thermal Conductivity: 16.2 W/mK
              - Electrical Conductivity: 1.45x10⁶ S/m
              - Melting Point: 1400-1450°C
            </example>

        4. ##Mesh Quality and Critical Locations:
          - Help me to identify critical locations on the model in the provided image that require high-quality meshing and how to mesh it and mentor me on why meshing that area is important to me 
          achieving accurate analysis result.
          - Help me provide mesh quality criteria for the critical areas you will suggest and what element sizing or other meshing technics and values you will follow to mesh the model accurately. 
          <examples>:
            - "At the top corner of the model where there is a hole, increase the mesh quality by using an *element size of 0.1* at the edges."
          </examples>
          Also check if the model in the image is an assemblied model and provide instructions on how contact must be applied on the models before meshing if not proceed with meshing.

        5. ##Boundary Conditions and Numerical Parameters:
          - Help me get close to realistic boundary condition parameters considering the original mass of the model as ${mass} use this to predict the boundary condition for the real model with one of the materials check for a values that can be applied based on the mass.
          state the material used and why and how you chose those boundary conditions which will let me follow and analysis the model accurately No BS.
          to the default mass ${mass} of the model in the image.
          Take note: I want you to derive the force, pressure and other conditions in words format and do not tell me to calculate it.
          <example : This does not mean you have to give me the same values here think of the precise values and output it> 
          - Based on the mass you should use a force of 10N or 20N etc or a pressure of 100MPa since you want to simulate a realistic experience with your model.
          </example>
          - Examine the model and suggest realistic boundary conditions and numerical parameters that is relatable with the model image and which spots to apply those conditions either pressure, force, fixed points and others. 
          <example>:
            - "Consider applying a fixed support at the bolted areas on the left and right sides of the model."
            - "Consider applying a downward-facing load of 10N on the top layer of the model."
          <example>
          - Also provide any necessary thing that could lead the successfully analysis with a kind of boundary condition considering the model image.

        6. ##Roadmap and Analysis Recommendations:
          - Help me using all the provided data, give me a clear and concise roadmap, such as which options do i click to result in the next and next step for conducting the analysis in ${option} ${customOption} with each analysis type you recommended.
          so if you suggested static analysis you provide how to do the analysis on that using the ${option} ${customOption} and likewise to other analysis type.
          Please help yourself from any confusion with the two different examples they are all meant for different softwares. Just use it as a sample for the those softwares, but I want you to think and precisely find the right processes for ${option} ${customOption}  based on the softwares documentation. 
          <example 1 for Ansys Workbench>
            Just use this as a blueprint and follow the exact format. 
              →Workbench
              Open ANSYS Workbench

              →Analysis_Systems
              Drag "Static Structural" from Analysis Systems to Project Schematic

              →Geometry
              Double-click "Geometry" cell
              Click "File" > "Import External Geometry File"
              Select phone holder CAD file
              Click "Generate" to create geometry

              →Engineering_Data
              Double-click "Engineering Data" cell
              Click "Engineering Data Sources"
              Expand "General Materials" > Select "Polycarbonate"(this must be a material that can be found on ansys)
              Click "Add to Engineering Data"
              Close Engineering Data window

              →Model
              Double-click "Model" cell to open Design Modeler
              Click "Generate" to create model
              Right-click model > "Named Selection" > Create selections for plug area and support points
              Click "Geometry" > you will find the model > click on the model > "Materials"> "Assignment"> 
              select material > "Aluminium alloy"

              →Setup
              Double-click "Setup" cell to open Mechanical
              Expand "Mesh" in outline
              Right-click "Mesh" > Insert "Method"
              Select body > Choose "Tetrahedrons" or "Automatic" under method
              Right-click "Mesh" > Insert "Sizing"
              Set element size to 2 mm
              Apply load around the circular section where is located below the the flat surface athe right corner
              Click "Generate Mesh"

              →Static_Structural (Go deep to show everystep that is involved)
              Expand "Static Structural" in outline
              Right-click > Insert > "Fixed Support"
              Select base of holder
              Right-click > Insert > "Force"
              Select plug area > Set to 50 N downward
              (This values should be based on calculations made with the default mass of the main model)

              →Solution(In here provide all the possible analysis results you would visualize in relation to the problem)
              Right-click "Solution" > Insert > "Total Deformation"
              Right-click "Solution" > Insert > "Equivalent Stress"
              Right-click "Solution" > Insert > "Equivalent Strain"

              →Solve
              Click "Solve" button in toolbar

              →Results
              Double-click each result item to view

              →Tools
              Click "Tools" > "Report Preview" to generate report

              →Save
              Click "File" > "Save As" > Name project "Phone_Holder_FEA.ansys"
          </example>
          <example 2 for abaqus>
            →Launch Abaqus/CAE
              Double click Abaqus icon
              Wait for the startup screen
              Click "With Standard/Explicit Model" option

              →Part Creation/Import
                Click "Part" module from menu bar
                Click "Create Part" button
                Select: 3D → Deformable → Solid → Continue
                Draw your geometry OR
                File → Import → Part → Select CAD file

              →Material Definition
                Click "Property" module
                Click "Create Material" button
                Enter name
                Click "Mechanical" → "Elasticity" → "Elastic"
                Enter Young's modulus and Poisson's ratio
                Click "OK"

              →Section Creation
                Stay in "Property" module
                Click "Create Section"
                Select "Solid" → "Homogeneous" → Continue
                Select your material → OK
                Click "Assign Section"
                Select entire part → Done
                Click "OK"

              →Assembly
                Click "Assembly" module
                Click "Create Instance"
                Select part → OK
                Choose "Independent" for mesh control

              →Step Creation
                Click "Step" module
                Click "Create Step"
                Select "Static, General" → Continue
                Accept defaults or modify → OK

              →Field Output Request
                Stay in Step module
                Click "Field Output Requests"
                Select required outputs (S, E, U by default)
                Click OK

              →Load/BC Application
                Click "Load" module
                Click "Create Boundary Condition"
                Select step → "Mechanical" → "Displacement/Rotation"
                Select surfaces → Done
                Enter values → OK
                Click "Create Load"
                Select load type → Continue
                Select surface → Done
                Enter values → OK

              →Mesh Generation
                Click "Mesh" module
                Click "Seed Part"
                Enter global size → OK
                Click "Mesh Controls"
                Select "Hex" or "Tet" → OK
                Click "Element Type"
                Select element family → OK
                Click "Mesh Part"
                Click "Yes" to mesh

              →Job Creation & Running
                Click "Job" module
                Click "Create Job"
                Enter name → Continue
                Click "OK"
                Right click job → Submit
                Right click job → Monitor

              →Results Visualization
                Wait for job completion
                Right click job → Results
                Opens Visualization module
                Click "Plot" for default display
                Use toolbar for different result types
          
          </example>
          <example 3 for SolidWorks These are just steps but you can add a little flesh to it>
          1. Tools > Add-ins > Check SolidWorks Simulation
          2. Simulation > Study > New Study
          3. Select the appropriate study type (e.g., Static, Thermal, Frequency)
          4. Right-click Part/Assembly in Simulation Tree > Apply Material to All Components
          5. Simulation Tree > External Loads > Select Load Type (e.g., Force, Pressure) > Apply
          6. Simulation Tree > Fixtures > Select Fixture Type (e.g., Fixed, Roller) > Apply
          7. Simulation Tree > Mesh > Create Mesh > Adjust Mesh Settings
          8. Simulation Tree > Run
          9. Simulation Tree > Results > Stress, Displacement, or Strain Plots
          10. Simulation Tree > Report > Generate Report
          </example>
          - Conclude on stating this to the user to proceed with understanding the post-processing process from *MeanAs Dashboard*.
        `;
       
    } else if (analysisType === 'CFD') {
      promptText = `
        Task: With this goal: ${description} Bolden the key factors and a professional format. No BS just meaning facts. 
        
        Objective: The output should be in a way that both a non-engineering & engineering student,
        business man, company or any other firm could understand and follow till a clear successful analysis solution.
        I trust you will deliver the best solutions. 

        #Start with a Catchy Heading based on the request. 

        1. ##Model Analysis and Geometry Cleanup: 
          - Analyze the model in the provided images, tell me just the main spots to focus on for geometry cleanup.
          - Check for errors, inconsistencies, and topological issues in the image model provided and state it clearly and concise.
    
        2. ##Flow Domain and Boundary Condition Setup:
          - Tell me the appropriate flow domain setup, including inlet, outlet, and wall boundary conditions and where on the model should that be applied.
          - Specify and elaborate any special boundary conditions that align with my ${description}.
          <example>
              -Create an enclosed flow domain around the model and let the leading edge face direction the named selection on that domain face should be named inlet
              and the trailing edge direction the named selection on that domain face should be named outlet and the overall domain be named walls.
              Inlet Condition:
              Velocity: 5 m/s
              Turbulence Intensity: 5%
              Outlet Condition:

              Gauge Pressure: 0 Pa
              Turbulence Intensity: 5% 
          </example>
    
        3. ##Mesh Quality and Refinement:
          - Check and identify critical regions in the model where flow gradients are expected to be high (e.g., near walls, around obstacles, or at interfaces) and state it.
          - Recommend mesh refinement strategies for these regions of the model in the image provided, including boundary layer meshing and local grid refinement. 
          <example>
            - "Refine the mesh near the leading edge of the airfoil with a minimum element size of 0.05 mm to capture the boundary layer effects accurately."
          </example>

        4. ##Fluid Properties and Material Selection:
          - Suggest 3 materials from ${materials} that best suit my goal and select the materials from MatWeb, including full numerical properties for use specifically for my analysis.
           <example>:
            - Stainless Steel
              - Density: 7.85 g/cm³
              - Tensile Strength: 515-720 MPa
              - Young's Modulus: 193 GPa
              - Thermal Conductivity: 16.2 W/mK
              - Electrical Conductivity: 1.45x10⁶ S/m
              - Melting Point: 1400-1450°C
            </example>
          if the material ${materials} is a liquid also follow the structure above to show the numerical properties.
    
        5. ##Solver Settings and Numerical Parameters:
          - Reason and choose the appropriate solver settings accurate for the type of flow (laminar, turbulent, compressible, incompressible) and the specific objectives of the analysis in relation to the goal.
          - Suggest turbulence models, time-stepping methods, or other solver parameters crucial for accurate and realistic results.
          That is providing the numerical value to use for the solving like the time-stepping and any important parameters.
    
        6. ##Roadmap and Analysis Recommendations:
            -Using all the provided data, give me a clear and concise roadmap that is which options do i click that results in the next and next for conducting the analysis in ${option} ${customOption} each analysis type you recommended.
            Do not get confused with the two different examples they are all meant for different softwares. Just use it as a sample but think and find the right processes for the selected analysis software. 
            <example 1 for Ansys Workbench>
              Just use this as a blueprint and follow the exact format.
              →Open ANSYS Workbench
              Open ANSYS Workbench on your computer.

              →Drag "Fluent" from Analysis Systems to Project Schematic
              In the "Analysis Systems" toolbox, find "Fluent" and drag it to the Project Schematic.

              →Geometry
              Double-click on the "Geometry" cell to open DesignModeler or SpaceClaim.
              Import your geometry file by clicking "File" > "Import External Geometry File".
              Select the geometry file and click "Open".

              →Geometry Cleanup
              Use tools in the DesignModeler or SpaceClaim to clean up the geometry:
              - Remove unnecessary features.
              - Repair any gaps or overlapping surfaces with....
              - Create a fluid domain if necessary by using "Create" > "Volume Extraction" for internal flows. or use encloser or fill for interior models fluid analysis.
              find how specific softwares create fluid domain for models.
          
              →Meshing
              Double-click on the "Mesh" cell to open the Meshing application.
              Set up the flow domain and apply boundary conditions by defining named selections for inlets, outlets, and walls based on what you recommended
              in the boundary condition section.

              →Named Selections
              Right-click on the "Mesh" > "Named Selections" > Create named selections for "Inlet", "Outlet", and "Walls".

              →Mesh Generation
              Double-click Mesh in the Project Schematic.
              Define the mesh:
              Set Element Size or use Adaptive Meshing for automatic refinement.
              Apply refinements (e.g., near walls, sharp features, inlets/outlets).
              Enable Inflation Layers for boundary layer meshing.
              Click Generate Mesh and check mesh quality (skewness, orthogonality).
              Save the mesh and move to the next step.
              <examples>:
                - "At the top corner of the model where there is a hole, increase the mesh quality by using an element size of 0.1 at the edges."
              </examples>
  
                Set Element Size:

                Base Size: 0.01 meters (10 mm)
                Inflation Layers: 5 layers with a growth rate of 1.2.
                Refinement near boundaries (walls, edges) to ensure high resolution.
                Generate Mesh and check quality:

                Skewness: Less than 0.95
                Orthogonal Quality: Greater than 0.1
                Total Elements: Around 500,000.
        
              →Setup - Fluent
              Double-click on the "Setup" cell to open ANSYS Fluent.
              In Fluent, go to the "Materials" panel by clicking "Define" > "Materials".
              Select the fluid material or create a new one by clicking "Create/Edit".
              Enter the material properties, such as density, viscosity, specific heat, and thermal conductivity.
              Double-click Setup in the Project Schematic to open Fluent.
                Solver Type:
                Select Pressure-based for incompressible flow.
                Select Steady-state solution.
                Define turbulence model:
                k-ε model, with constants:
                Cµ = 0.09
                C1 = 1.44
                C2 = 1.92

              →Material Assignment
              Assign the defined fluid to the relevant zones in the model under "Cell Zone Conditions".
              Define the fluid:
                -Material: Air
                -Density: 1.225 kg/m³
                -Viscosity: 0.0000181 Pa·s
                -Thermal Conductivity: 0.026 W/m·K

              →Solver Configuration
              In Fluent, go to "Solver" > "Models".
              Select the appropriate flow model (e.g., Laminar, k-epsilon, k-omega for turbulence).
              Choose the energy model if heat transfer is involved.
              Set up the solver settings under "Solution Methods", selecting appropriate schemes (e.g., SIMPLE, Coupled) and discretization methods.
              Number of Iterations: 2000
                Under-relaxation factors:
                Momentum: 0.7
                Pressure: 0.3
                Turbulent Kinetic Energy: 0.8
              →Boundary Conditions
              Set up the boundary conditions under "Boundary Conditions" in Fluent with the current default mass of the model being ${mass}.
              Specify conditions for inlets (velocity, mass flow rate), outlets (pressure), and walls (no-slip, moving walls).
          
              →Run Calculation
              Go to "Run Calculation" panel in Fluent.
              Set the number of iterations or time steps for transient simulations. example 100-3000 iterations
              Click "Calculate" to start the simulation.

              →Post-Processing
              After the simulation, go to the "Results" panel in Fluent.
              Use "Contours", "Vectors", and "Streamlines" tools to visualize the flow fields.
              Extract key performance indicators such as pressure drop, drag coefficients, or heat transfer rates.

              →Export Results
              Export the simulation data and results by going to "File" > "Export" > "Solution Data".
              Save the data in a preferred format for further analysis or reporting.

              →Save Project
              Click "File" > "Save As" to save your project with a descriptive name.
          </example>
          - Conclude on stating this to the user to proceed with understanding the post-processing process from *MeanAs Dashboard*.
      `;
    } else {
      promptText = `
      The provided analysis type (${analysisType}) is not recognized or is invalid. Please specify a valid analysis type (e.g., 'FEA' for Finite Element Analysis or 'CFD' for Computational Fluid Dynamics) to proceed.
      Bolden the key factors
      Ensure the following details are included:
      - Analysis Type: Choose between 'FEA' or 'CFD'.
      - Description: Provide a brief description of the analysis.
      - Materials: Specify the materials used in the analysis.
      - Option: Specify any specific options or custom settings for the analysis.
      - Custom Option: Provide any additional custom details relevant to the analysis.
      - Detail Level: Indicate the level of detail required for the final report (e.g., High Student Level, Detailed Technical Insight, Marketing Level, Research Level).
  
      Completing all required fields will ensure accurate and effective analysis.
      `;
    }

    // Call callGPTAPI to process images and the prompt
    const gptResponse = await callGPTAPI(validImageUrls, promptText);
    const generatedResponse = gptResponse['choices'][0]['message']

    // Save the generated response to Firestore
    await projectRef.update({
      generatedResponse,
      responseGeneratedAt: new Date()
    })

    await firestore.collection(`tmpSubscriptionUsage`).add({userId: user.uid});

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