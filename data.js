const portfolioData = {
  integrations: {
    // Public JSON endpoint for episode metadata. An empty value uses the saved archive.
    episodeFeedUrl: ""
  },
  profile: {
    yearsIndustry: "3+",
    projects: "8+",
    skills: "20+"
  },

  experience: [
    {
      role: "Reliability & Rotating Equipment Engineer",
      company: "Egyptian Refining Company",
      date: "2023 – Present",
      bullets: [
        "Implement and manage condition-monitoring programs for critical rotating equipment using vibration analysis, oil analysis and thermal imaging.",
        "Lead root cause analysis investigations for equipment failures and develop corrective and preventive action plans.",
        "Develop and optimize preventive, predictive and corrective maintenance strategies to improve equipment reliability and reduce operational downtime."
      ]
    },
    {
      role: "Structural & Thermal Engineer (Part-Time)",
      company: "Advanced Rocket Technologies (ART)",
      date: "2023 – 2024",
      bullets: [
        "Performed finite element analysis on structural components of low-cost launch systems under mechanical and thermal loading.",
        "Conducted heat-transfer simulations to evaluate thermal performance and operating limits."
      ]
    },
    {
      role: "Maintenance Engineer",
      company: "Cairo Metro – Third Line",
      date: "2022",
      bullets: [
        "Executed preventive maintenance for large-scale HVAC systems, including chillers, AHUs and FCUs across metro stations."
      ]
    }
  ],

  expertise: [
    { icon: "⚙️", title: "Field Engineering (R)", text: "Rotating equipment maintenance, turnaround execution, and mechanical strength analysis." },
    { icon: "📈", title: "Reliability & Diagnostics", text: "Vibration analysis, RCA, condition monitoring, and predictive maintenance." },
    { icon: "🔥", title: "Energy & Research (G)", text: "Thermodynamics, heat transfer, biomass conversion, and torrefaction systems." },
    { icon: "🐍", title: "Computation & AI (B)", text: "Python, MATLAB, Machine Learning (ML), and data-driven engineering optimization." },
    { icon: "📐", title: "Mechanical / MEP Design", text: "HVAC, firefighting, plumbing, CAD/CAE and multidisciplinary engineering design." },
    { icon: "🚀", title: "Aerospace Systems", text: "Structural design, launch system mechanics, and thermal load analysis." }
  ],

  projects: [
    {
      title: "Rotating Equipment Condition Monitoring",
      category: "field",
      tag: "FIELD ENG / R",
      description: "Condition monitoring, failure investigation and reliability improvement for critical rotating equipment.",
      image: "",
      repo: "https://github.com/MohammedRagab99"
    },
    {
      title: "Vibration Analysis Notebook",
      category: "computation",
      tag: "COMPUTATION / B",
      description: "A Python-based workflow for signal processing, FFT, spectrum interpretation and engineering visualization.",
      image: "",
      repo: "https://github.com/MohammedRagab99"
    },
      {
    title: "Nile Delta Sea-Level Rise & Soil Salinity Risk Assessment",
    category: "environmental",
    tag: "CLIMATE / REMOTE SENSING",
    description: "Machine learning projection of sea-level rise impacts on Nile Delta soil salinity, integrating Sentinel-2, Copernicus DEM, and field ECe data. Includes hybrid groundwater intrusion model, agronomic tiered economic loss, Monte Carlo uncertainty, and SHAP explainability.",
    image: "",
    repo: "https://github.com/MohammedRagab99"
  },
  {
    title: "Integrated Assessment of Decentralised Torrefaction Pathways for Industrial Decarbonisation in Egypt",
    category: "energy",
    tag: "ENERGY / RESEARCH",
    description: "Geospatial, reactor engineering, logistics, and techno-economic analysis of mobile autothermal torrefaction units converting Egyptian agricultural residues into a coal substitute for cement kilns. Includes GIS mapping, autothermal reactor design, supply chain optimisation, Monte Carlo uncertainty, and CO₂ abatement.",
    image: "",
    repo: ""
  },
  {
    title: "Torrefaction Reactor Control System",
    category: "energy",
    tag: "BIOMASS / THERMAL PROCESSING",
    description: "Arduino-based state machine for biomass torrefaction, implementing stoichiometric startup, PID steady-state control, auger management, and safety fault handling per Kevin S. Kung's thesis (Chapter 7).",
    image: "",
    repo: ""
  },
  {
    title: "Rotating Equipment Reliability & Maintenance Performance Dashboard",
    category: "industrial",
    tag: "MAINTENANCE / RELIABILITY",
    description: "Excel VBA-powered executive dashboard integrating PM, CM, work confirmations, notifications, and upcoming work orders. Calculates PM compliance, CM/PM ratio, backlog, MTBF, bad actors, and improved equipment lists. Generates 17+ pivot charts for reliability analysis.",
    image: "",
    repo: ""
  },
    {
      title: "Torrefaction / Biomass Conversion",
      category: "energy",
      tag: "ENERGY / G",
      description: "Research work around agricultural-waste conversion, torrefaction, energy performance and reactor analysis.",
      image: "",
      repo: "https://github.com/MohammedRagab99"
    },
    {
      title: "GPR Yield Prediction",
      category: "computation",
      tag: "AI / ML / B",
      description: "Data-driven prediction work for torrefaction yield using Gaussian Process Regression (Machine Learning).",
      image: "",
      repo: "https://github.com/MohammedRagab99/torrefaction-GPR-yield-prediction"
    },
    {
      title: "Hospital MEP Design",
      category: "design",
      tag: "DESIGN",
      description: "Team-led HVAC, firefighting, water supply and drainage design for a multi-building hospital project.",
      image: "",
      repo: "https://github.com/MohammedRagab99"
    },
    {
      title: "Satellite / CubeSat Mechanism",
      category: "aerospace",
      tag: "AEROSPACE",
      description: "Mechanical systems training and project work connected to satellite structures and deployment mechanisms.",
      image: "",
      repo: "https://github.com/MohammedRagab99"
    }
  ],

  machinery: [
    // Pumps
    { name: "Centrifugal Pump", family: "Pumps", category: "pumps" },
    { name: "Diaphragm Pump (AODD)", family: "Pumps", category: "pumps" },
    { name: "Gear / Lube Oil Pump", family: "Pumps", category: "pumps" },
    { name: "Liquid Ring Vacuum Pump", family: "Pumps", category: "pumps" },
    { name: "Metering / Dosing Pump", family: "Pumps", category: "pumps" },
    { name: "Reciprocating Pump", family: "Pumps", category: "pumps" },
    { name: "Screw / Rotary Pumps", family: "Pumps", category: "pumps" },
    { name: "General Pump", family: "Pumps", category: "pumps" },

    // Compressors
    { name: "Centrifugal Compressor", family: "Compressors", category: "compressors" },
    { name: "Reciprocating Compressor", family: "Compressors", category: "compressors" },
    { name: "General Compressor", family: "Compressors", category: "compressors" },
    { name: "Positive Displacement Blower", family: "Compressors", category: "compressors" },
    { name: "Gas Booster", family: "Compressors", category: "compressors" },

    // Fans & Blowers
    { name: "Axial Fan", family: "Fans & Blowers", category: "fans-blowers" },
    { name: "Centrifugal Fan", family: "Fans & Blowers", category: "fans-blowers" },
    { name: "Forced Draft Fan", family: "Fans & Blowers", category: "fans-blowers" },
    { name: "Exhaust Fan", family: "Fans & Blowers", category: "fans-blowers" },
    { name: "General Fan", family: "Fans & Blowers", category: "fans-blowers" },
    { name: "Fan Air Intake Device", family: "Fans & Blowers", category: "fans-blowers" },
    { name: "Silencer / Acoustic Enclosure", family: "Fans & Blowers", category: "fans-blowers" },

    // Turbines & Drivers
    { name: "Steam Turbine", family: "Turbines & Drivers", category: "turbines-drivers" },
    { name: "Diesel Engine", family: "Turbines & Drivers", category: "turbines-drivers" },
    { name: "Emergency Generator", family: "Turbines & Drivers", category: "turbines-drivers" },
    { name: "Gearbox", family: "Turbines & Drivers", category: "turbines-drivers" },
    { name: "Hydraulic Motor", family: "Turbines & Drivers", category: "turbines-drivers" },
    { name: "Hydraulic Governor", family: "Turbines & Drivers", category: "turbines-drivers" },
    { name: "Mechanical Governor", family: "Turbines & Drivers", category: "turbines-drivers" },
    { name: "Overspeed Device", family: "Turbines & Drivers", category: "turbines-drivers" },
    { name: "Hydraulic Power Unit", family: "Turbines & Drivers", category: "turbines-drivers" },

    // Specialty / Auxiliary
    { name: "Accumulator", family: "Specialty / Auxiliary", category: "specialty-auxiliary" },
    { name: "Agitator / Mixer", family: "Specialty / Auxiliary", category: "specialty-auxiliary" },
    { name: "Dampeners", family: "Specialty / Auxiliary", category: "specialty-auxiliary" },
    { name: "Filters", family: "Specialty / Auxiliary", category: "specialty-auxiliary" },
    { name: "Ignition Chamber", family: "Specialty / Auxiliary", category: "specialty-auxiliary" },
    { name: "Mist Eliminator", family: "Specialty / Auxiliary", category: "specialty-auxiliary" },
    { name: "Oil Skimmer", family: "Specialty / Auxiliary", category: "specialty-auxiliary" },
    { name: "Rotary Slide Valve", family: "Specialty / Auxiliary", category: "specialty-auxiliary" },
    { name: "Steam Ejector", family: "Specialty / Auxiliary", category: "specialty-auxiliary" }
  ],

  majorOverhaul: [
    {
      phase: "Planning",
      activities: [
        "Scope definition & resource planning",
        "Criticality assessment",
        "Spare parts procurement",
        "Tooling & rigging preparation"
      ]
    },
    {
      phase: "Inspection & Disassembly",
      activities: [
        "Pre-overhaul baseline measurements",
        "Dimensional & visual inspection",
        "Component tagging & documentation",
        "Non-destructive testing (NDT) coordination"
      ]
    },
    {
      phase: "Repair & Replacement",
      activities: [
        "Bearing replacement & fitting",
        "Seal & gasket renewal",
        "Shaft alignment checks",
        "Component machining / refurbishment"
      ]
    },
    {
      phase: "Reliability Assessment",
      activities: [
        "Root cause analysis of failures",
        "Clearance verification",
        "Material condition review",
        "Upgrade opportunities identification"
      ]
    },
    {
      phase: "Reassembly & Alignment",
      activities: [
        "Step-by-step reassembly per OEM specs",
        "Laser alignment & soft foot correction",
        "Torque verification",
        "Lubrication system flush"
      ]
    },
    {
      phase: "Return to Service",
      activities: [
        "Pre-startup safety review (PSSR)",
        "Performance testing & baseline data",
        "Vibration / temperature trending",
        "Handover documentation"
      ]
    }
  ],
upwork: {
  name: "Mohammed R.",
  title: "Mechanical Power & Energy Engineer",
  hourlyRate: "$40.00/hr",
  totalEarnings: "$100+",
  totalJobs: 2,
  rating: 5.0,
  reviews: 1,
  verified: true,
  status: "Online",
  location: "Cairo, Egypt",
  hoursPerWeek: "More than 30 hrs/week",
  summary: "Energy & Power Mechanical Engineer with expertise in CAD, MEP, field work, R&D, and rotating equipment reliability.",
  skills: [
    "Mechanical Engineering", "MATLAB", "SolidWorks", "Autodesk Inventor",
    "Energy", "Hydropower", "LabVIEW", "Aspen Plus", "Python",
    "Aspen HYSYS", "Oracle Primavera", "CAD Software", "Data Analysis"
  ],
  recentJob: {
    title: "Engineer Required to Decipher Hydraulic Calculations in Fire Suppression App",
    rating: 5.0,
    review: "\"I recently had the pleasure of working with Eng. Mohammed Ragab on a highly specialized project...\"",
    date: "Aug 2023 - Nov 2023",
    earnings: "$185.00"
  },
  profileUrl: "https://www.upwork.com/freelancers/~014c42cdf6420c6a26"
},
  
  services: [
  {
    title: "Excel Data Cleaning & Organization",
    category: "excel",
    price: 15,
    delivery: "1 day",
    revisions: 1,
    description: "Clean, organize, and format your messy Excel spreadsheet. Includes basic formulas, pivot table setup, and formatting.",
    skills: ["Excel", "Data Cleaning", "VBA"],
    link: "https://www.upwork.com/freelancers/~014c42cdf6420c6a26"
  },
  {
    title: "Python Script for Automation",
    category: "programming",
    price: 25,
    delivery: "2 days",
    revisions: 2,
    description: "Custom Python script to automate repetitive tasks, scrape data, or process files. Delivered with clear instructions.",
    skills: ["Python", "Automation", "Scripting"],
    link: "https://www.upwork.com/freelancers/~014c42cdf6420c6a26"
  },
  {
    title: "VBA Dashboard for Maintenance KPIs",
    category: "engineering",
    price: 50,
    delivery: "3 days",
    revisions: 3,
    description: "Build an Excel VBA dashboard for PM compliance, MTBF, bad actors, and maintenance backlog. Includes interactive charts.",
    skills: ["VBA", "Reliability", "Data Visualization"],
    link: "https://www.upwork.com/freelancers/~014c42cdf6420c6a26"
  }
],
  certificates: [
    // Field / Reliability
    {
      title: "Vibration Analysis Category VCAT II",
      provider: "Mobius Institute",
      year: "2026",
      category: "field",
      image: "assets/images/certificates/vcat-ii-mohamed-ragab.png"
    },
    {
      title: "Between Bearing Pump Repair and API Plans",
      provider: "Flowserve",
      year: "2026",
      category: "field",
      image: "assets/images/certificates/flowserve-pump.png"
    },
    {
      title: "Reliability Centered Maintenance (RCM)",
      provider: "Enppi",
      year: "2026",
      category: "field",
      image: "assets/images/certificates/rcm.png"
    },
    {
      title: "Reliability Centered Maintenance (RCM) - Part 1",
      provider: "Enppi",
      year: "2025",
      category: "field",
      image: "assets/images/certificates/RCM_Part1.png"
    },
    {
      title: "Compressors Operation and Maintenance",
      provider: "RES Global",
      year: "2025",
      category: "field",
      image: "assets/images/certificates/compressors-res-global-2025.png"
    },
    {
      title: "RECIP Technical Certificate",
      provider: "EPROM & HOERBIGER",
      year: "2025",
      category: "field",
      image: "assets/images/certificates/recip-compressor.png"
    },
    {
      title: "Bearing Technology And Service",
      provider: "NSK",
      year: "2024",
      category: "field",
      image: "assets/images/certificates/nsk-bearing.png"
    },
    {
      title: "Speed Sensors: Hall Effect",
      provider: "Istec Sphere",
      year: "2025",
      category: "field",
      image: "assets/images/certificates/Mohammed-Ragab-Speed-sensors-Hall-effect-Speed-sensing-expert-Istec-Sphere.png"
    },
    {
      title: "Speed Sensors: Eddy Current",
      provider: "Istec Sphere",
      year: "2025",
      category: "field",
      image: "assets/images/certificates/Mohammed-Ragab-Speed-sensors-eddy-current-Speed-sensing-expert-Istec-Sphere.png"
    },
    {
      title: "Speed Sensors: Variable Reluctance",
      provider: "Istec Sphere",
      year: "2025",
      category: "field",
      image: "assets/images/certificates/Mohammed-Ragab-Speed-sensors-variable-reluctance-Speed-sensing-expert-Istec-Sphere.png"
    },
    {
      title: "Vibration Training Category 1 - Final Exam",
      provider: "EPROM / Istec",
      year: "2025",
      category: "field",
      image: "assets/images/certificates/mrhamed@eprom.ercegypt.com-Final-Exam-Vibration-Training-Category-1-Istec-Vibration-Training-Category-1-Istec-Sphere.png"
    },
    {
      title: "International Conference on Energy Systems (ICES 2025)",
      provider: "Ain Shams University",
      year: "2025",
      category: "energy",
      image: "assets/images/certificates/ices-2025-energy-systems-conference.png"
    },
    {
      title: "Refinery Fundamentals Program for Postgraduates",
      provider: "EPROM",
      year: "2023",
      category: "oil-gas",
      image: "assets/images/certificates/Refinery Fundamentals Program.png"
    },
    {
      title: "Designing Survival Systems for Desert Reclamation in Egypt",
      provider: "Nile University",
      year: "2022",
      category: "energy",
      image: "assets/images/certificates/desert-reclamation-project.jpg"
    },
    {
      title: "Satellite Structure Subsystem",
      provider: "Egyptian Space Agency",
      year: "2021",
      category: "aerospace",
      image: "assets/images/certificates/esa-satellite-structure.png"
    },
    {
      title: "First Rank: Mechanics Teams",
      provider: "Egyptian Space Agency",
      year: "2021",
      category: "aerospace",
      image: "assets/images/certificates/Egyptian Space Agency - First Rank Mechanics Team.png"
    },
    {
      title: "Best Member Powertrain: Formula Student UK'21",
      provider: "ASU Racing Team",
      year: "2021",
      category: "aerospace",
      image: "assets/images/certificates/ASU Racing Team - Formula Student UK 2021 Best Member.png"
    },
    {
      title: "CS50x: Introduction to Computer Science",
      provider: "Harvard University",
      year: "2020",
      category: "computation",
      image: "assets/images/certificates/CS50 Harvard - CS50x Introduction to Computer Science.png"
    },
    {
      title: "CS50's Introduction to Artificial Intelligence with Python",
      provider: "Harvard University",
      year: "2020",
      category: "computation",
      image: "assets/images/certificates/CS50 Harvard - Introduction to Artificial Intelligence with Python.png"
    },
    {
      title: "Become a Software Developer",
      provider: "LinkedIn Learning",
      year: "2021",
      category: "computation",
      image: "assets/images/certificates/LinkedIn Learning - Become a Software Developer.png"
    },
    {
      title: "Learning Python",
      provider: "LinkedIn Learning",
      year: "2021",
      category: "computation",
      image: "assets/images/certificates/LinkedIn Learning - Learning Python.png"
    },
    {
      title: "Learning C#",
      provider: "LinkedIn Learning",
      year: "2021",
      category: "computation",
      image: "assets/images/certificates/linkedin-learning-csharp.png"
    },
    {
      title: "Learning SQL Programming",
      provider: "LinkedIn Learning",
      year: "2021",
      category: "computation",
      image: "assets/images/certificates/LinkedIn Learning - Learning SQL Programming (2017).png"
    },
    {
      title: "Programming Foundations: Databases",
      provider: "LinkedIn Learning",
      year: "2021",
      category: "computation",
      image: "assets/images/certificates/LinkedIn Learning - Programming Foundations Databases.png"
    },
    {
      title: "Project Management Foundations: Teams",
      provider: "LinkedIn Learning",
      year: "2021",
      category: "design",
      image: "assets/images/certificates/LinkedIn Learning - Project Management Foundations Teams.png"
    },
    {
      title: "Become a Graphic Designer",
      provider: "LinkedIn Learning",
      year: "2021",
      category: "design",
      image: "assets/images/certificates/LinkedIn Learning - Become a Graphic Designer.png"
    },
    {
      title: "innovegypt Program",
      provider: "ITIDA & TIEC",
      year: "2021",
      category: "design",
      image: "assets/images/certificates/ITIDA TIEC innovegypt - Innovation Training Course.png"
    },
    {
      title: "Reimagining the Future of Learning",
      provider: "Aspire Learning Space",
      year: "2021",
      category: "design",
      image: "assets/images/certificates/Aspire Learning Space - Reimagining the Future of Learning.png"
    }
  ],

  research: {
    title: "Development of a decentralized agricultural waste to solid fuel conversion system",
    intro: "My Master's research focuses on biomass conversion, torrefaction, energy systems, measurements and control engineering, with an emphasis on practical conversion of agricultural waste into useful solid fuel.",
    bullets: [
      "Biomass conversion and torrefaction",
      "Reactor modeling and process analysis",
      "Measurements and control",
      "Energy performance and optimization",
      "Data-driven engineering / machine learning"
    ],
    links: [
      { label: "GitHub research repositories", url: "https://github.com/MohammedRagab99" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/mohamed-ragab-hamad" }
    ]
  },

  achievements: [
    { icon: "🏆", title: "First Rank: Mechanics Teams", issuer: "Egyptian Space Agency", year: "2021" },
    { icon: "🏎", title: "Best Member Powertrain", issuer: "Formula Student UK", year: "2021" },
    { icon: "🎓", title: "CS50x & CS50 AI Certifications", issuer: "Harvard University", year: "2020" },
    { icon: "📊", title: "Vibration Analysis Category II", issuer: "Mobius Institute", year: "2026" },
    { icon: "⚙️", title: "Reliability Centered Maintenance", issuer: "Enppi", year: "2026" },
    { icon: "🔩", title: "Multiple Industry Certifications", issuer: "Flowserve, NSK, RES Global", year: "2024-2026" }
  ],

  careerInterests: [
    "Reliability Engineering",
    "Condition Monitoring",
    "Rotating Equipment",
    "Maintenance Engineering",
    "Energy Systems",
    "Data Analytics",
    "AI Applications in Engineering",
    "Predictive Maintenance"
  ],

  skillCategories: [
    {
      name: "Mechanical & Rotating Equipment",
      items: ["Pumps", "Compressors", "Bearings", "Maintenance", "Reliability Engineering", "Vibration Analysis", "Condition Monitoring"]
    },
    {
      name: "Software & Programming",
      items: ["Python", "SQL", "C#", "Git", "HTML", "CSS", "JavaScript"]
    },
    {
      name: "Engineering Software",
      items: ["AutoCAD", "SolidWorks", "ANSYS"]
    }
  ],

  skills: [
    { name: "Field Engineering (Maintenance & Reliability)", value: 92 },
    { name: "Rotating Equipment", value: 90 },
    { name: "Vibration Analysis", value: 85 },
    { name: "Energy Systems & Thermodynamics", value: 88 },
    { name: "Computation (Python / MATLAB / AI)", value: 82 },
    { name: "Mechanical / MEP Design", value: 80 }
  ],

  tools: [
  // Programming & scripting
  "Python", "MATLAB", "Octave", "C++ / Java", "VBA",
  "Visual Basic for Applications",

  // AI & data science
  "AI / Machine Learning", "pandas", "SQL", "ETL", "Data Cleaning",
  "Data Analysis", "Data Visualization", "Data Modeling",
  "Microsoft Power BI", "Power Query",

  // Spreadsheet & automation
  "Microsoft Excel", "Excel", "Excel Macros", "Spreadsheet Automation",

  // Engineering design & CAD
  "ANSYS", "SolidWorks", "AutoCAD", "Revit MEP", "Inventor",

  // Energy & simulation
  "Aspen Plus", "HOMER Pro", "EnergyPLAN", "WANDA", "PVSyst",
  "Energy Simulation", "Energy Modeling Software", "Energy Optimization",
  "Solar Energy",

  // Control & automation
  "LabVIEW", "PLC / Ladder Logic",

  // Project management & studies
  "Primavera P6", "Feasibility Study"
],

  education: [
    {
      degree: "Master of Engineering (MEng), Mechanical Engineering",
      institution: "Ain Shams University",
      start: "2022",
      end: "2024",
      location: "Cairo, Egypt",
      description: "Thesis: Development of a decentralized agricultural waste to solid fuel conversion system."
    },
    {
      degree: "Bachelor of Engineering (BEng), Mechanical Engineering",
      institution: "Ain Shams University",
      start: "2017",
      end: "2022",
      location: "Cairo, Egypt"
    }
  ],

  publications: [],

  awards: [
    {
      title: "First Rank: Mechanics Teams",
      issuer: "Egyptian Space Agency",
      year: "2021"
    },
    {
      title: "Best Member Powertrain: Formula Student UK'21",
      issuer: "ASU Racing Team",
      year: "2021"
    }
  ],

  languages: [
    { language: "Arabic", proficiency: "Native" },
    { language: "English", proficiency: "Fluent" },
    { language: "French", proficiency: "Basic" }
  ],

  ragabverse: {
    characters: [
      {
        id: "mohammed",
        name: "Mohammed",
        nameAr: "محمد",
        role: "The Narrator / The Human",
        color: "#FFFFFF",
        archetype: "Anchor & Witness",
        strengths: ["Curiosity", "Practicality"],
        weakness: "Over-documenting",
        speechStyle: "Calm measured Arabic/English mix",
        movementStyle: "Deliberate slow gestures",
        wardrobe: "Neutral linen/cotton earth tones",
        voice: "own",
        appears: ["Intros", "Research", "Takeaways & lessons"],
        entryStyle: "Walks in from side settling at desk",
        exitStyle: "Fades or walks out with closing thought"
      },
      {
        id: "raaed",
        name: "Raaed",
        nameAr: "رائد",
        role: "The Executor / Red Voice",
        color: "#FF2B2B",
        archetype: "Catalyst",
        strengths: ["Speed", "Decisiveness"],
        weakness: "Impulsiveness",
        speechStyle: "Short punchy sentences verbs first",
        movementStyle: "Fast sharp movements leans forward",
        wardrobe: "Dark red accent tee black utility pants",
        voice: "elevenlabs",
        appears: ["Execution", "Experiments", "Breakdowns", "Prototypes"],
        entryStyle: "Slams in or bursts onto screen",
        exitStyle: "Cuts away mid-sentence or jumps to next action"
      },
      {
        id: "gamal",
        name: "Gamal",
        nameAr: "جمال",
        role: "The Planner / Green Voice",
        color: "#2BFF5C",
        archetype: "Architect",
        strengths: ["Structure", "Risk-balance"],
        weakness: "Analysis paralysis",
        speechStyle: "Measured asks questions first",
        movementStyle: "Controlled upright paces slowly",
        wardrobe: "Olive green shirt rolled sleeves beige chinos",
        voice: "elevenlabs",
        appears: ["Planning", "Leadership", "Project management", "Career tradeoffs"],
        entryStyle: "Enters with clipboard or tablet pauses center",
        exitStyle: "Exits after nod or next step gesture"
      },
      {
        id: "bob",
        name: "Bob",
        nameAr: "بوب",
        role: "The Analyst / Blue Voice",
        color: "#2B7BFF",
        archetype: "Diagnostician",
        strengths: ["Insight", "Data-rigor"],
        weakness: "Over-analysis",
        speechStyle: "Fast when excited equations diagrams",
        movementStyle: "Still then sudden lean-in hand gestures",
        wardrobe: "Navy polo jeans tech accessories",
        voice: "elevenlabs",
        appears: ["Diagnostics", "Python", "MATLAB", "AI", "Modeling"],
        entryStyle: "Slides in with hologram or screen appears",
        exitStyle: "Fades with data visualization dissolving"
      }
    ],
    episodes: [
      { ep: 1, title: "The Empty Room", titleAr: "الغرفة الفارغة", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Film room as-is: marble, cornice, openings; explain conversion concept.", category: "reliability" },
      { ep: 2, title: "The Plan", titleAr: "الخطة", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Sketch, measurements, desk/camera/Hero Wall layout.", category: "reliability" },
      { ep: 3, title: "The Engineering", titleAr: "الهندسة", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Design decisions, constraints, columns, materials, circulation paths.", category: "reliability" },
      { ep: 4, title: "Electrical Infrastructure", titleAr: "البنية الكهربائية", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Document electrical/data/media/control rough-in.", category: "reliability" },
      { ep: 5, title: "Hero Wall", titleAr: "جدار البطل", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Charcoal paint, oak slats, shelves, logo, Halo lighting.", category: "energy" },
      { ep: 6, title: "Lighting", titleAr: "الإضاءة", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "General lighting, face lighting, character color tests.", category: "energy" },
      { ep: 7, title: "Desk", titleAr: "المكتب", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Desk fabrication, workstation setup, cable management.", category: "energy" },
      { ep: 8, title: "Camera Setup", titleAr: "إعداد الكاميرا", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Camera/mic positions, audio/framing tests.", category: "energy" },
      { ep: 9, title: "The Characters", titleAr: "الشخصيات", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Introduce Raaed, Gamal, Bob, Mohammed and interaction style.", category: "career" },
      { ep: 10, title: "First Video", titleAr: "أول فيديو", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Record and edit first complete video from studio.", category: "programming" },
      { ep: 11, title: "The Failure", titleAr: "الفشل", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Document real problem during build/production and fix.", category: "programming" },
      { ep: 12, title: "The Final Studio", titleAr: "الاستوديو النهائي", date: "2026-XX-XX", status: "planned", thumbnail: "", youtubeId: "", shorts: [], linkedinPost: "", githubWriteup: "", description: "Final tour, before/after, first complete frame.", category: "programming" }
    ],
    contentPillars: [
      { id: "reliability", name: "Reliability & Rotating Equipment", color: "#FF2B2B", topics: ["Bearing diagnosis", "Pump vibration", "Misalignment vs Unbalance", "Compressor faults", "RCA", "RCM"] },
      { id: "energy", name: "Renewable Energy & Biomass", color: "#2BFF5C", topics: ["Torrefaction", "DAEM modeling", "Biomass conversion", "Energy systems"] },
      { id: "research", name: "Research & Modeling", color: "#2B7BFF", topics: ["Python/MATLAB modeling", "Simulation", "GPR", "Data-driven engineering"] },
      { id: "programming", name: "Programming & Control", color: "#2B7BFF", topics: ["Arduino", "PLC", "PI control", "Automation", "Home Assistant"] },
      { id: "career", name: "Career Path", color: "#FFFFFF", topics: ["Engineering growth", "Decisions", "Tradeoffs", "Mentorship"] },
      { id: "experiments", name: "Experiments & Projects", color: "#FF2B2B", topics: ["Hands-on builds", "Test rigs", "Prototypes", "Field experiments"] }
    ]
  }
};
