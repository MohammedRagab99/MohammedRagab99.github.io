/*
  EDIT THIS FILE to update the portfolio.
  You can add/edit experience, projects, certificates, research, skills and tools
  without changing the HTML layout.
*/

const portfolioData = {
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
    { icon: "⚙️", title: "Reliability Engineering", text: "Condition monitoring, RCA, maintenance strategy, predictive maintenance and reliability improvement." },
    { icon: "🔩", title: "Rotating Equipment", text: "Pumps, compressors, turbines, bearings, lubrication and failure-mode thinking." },
    { icon: "📈", title: "Vibration Analysis", text: "Spectrum interpretation, fault diagnosis and machine-condition assessment." },
    { icon: "🔥", title: "Energy Systems", text: "Thermodynamics, heat transfer, biomass conversion, torrefaction and energy analysis." },
    { icon: "🐍", title: "Programming & Data", text: "Python, MATLAB and Octave for analysis, simulation, automation and engineering workflows." },
    { icon: "📐", title: "Mechanical / MEP Design", text: "HVAC, firefighting, plumbing, CAD/CAE and multidisciplinary engineering design." }
  ],

  projects: [
    {
      title: "Rotating Equipment Condition Monitoring",
      category: "reliability",
      tag: "RELIABILITY",
      description: "Condition monitoring, failure investigation and reliability improvement for critical rotating equipment.",
      image: "",
      repo: "https://github.com/MohammedRagab99"
    },
    {
      title: "Vibration Analysis Notebook",
      category: "programming",
      tag: "DATA + RELIABILITY",
      description: "A Python-based workflow for signal processing, FFT, spectrum interpretation and engineering visualization.",
      image: "",
      repo: "https://github.com/MohammedRagab99"
    },
    {
      title: "Torrefaction / Biomass Conversion",
      category: "energy",
      tag: "ENERGY",
      description: "Research work around agricultural-waste conversion, torrefaction, energy performance and reactor analysis.",
      image: "",
      repo: "https://github.com/MohammedRagab99"
    },
    {
      title: "GPR Yield Prediction",
      category: "programming",
      tag: "MACHINE LEARNING",
      description: "Data-driven prediction work for torrefaction yield using Gaussian Process Regression.",
      image: "",
      repo: "https://github.com/MohammedRagab99/torrefaction-GPR-yield-prediction"
    },
    {
      title: "Hospital MEP Design",
      category: "design",
      tag: "MEP",
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

  certificates: [
    // --- Reliability & Rotating Equipment ---
    { title: "Vibration Analysis Category VCAT II", provider: "Mobius Institute", year: "2026", category: "reliability", image: "assets/images/certificates/vcat-ii Mohamed Ragab Al Attar.png" },
    { title: "Between Bearing Pump Repair and API Plans", provider: "Flowserve", year: "2026", category: "reliability", image: "assets/images/certificates/flowserve-pump.png" },
    { title: "Reliability Centered Maintenance (RCM)", provider: "Enppi", year: "2026", category: "reliability", image: "assets/images/certificates/rcm.png" },
    { title: "Reliability Centered Maintenance (RCM) - Part 1", provider: "Enppi", year: "2025", category: "reliability", image: "assets/images/certificates/RCM_Part1.png" },
    { title: "Compressors Operation and Maintenance", provider: "RES Global", year: "2025", category: "reliability", image: "assets/images/certificates/Compressors - RES Global - 23 Nov - 7 Dec 2025 - Mohamed Ragab Hamed El Sayed.png" },
    { title: "RECIP Technical Certificate", provider: "EPROM & HOERBIGER", year: "2025", category: "reliability", image: "assets/images/certificates/recip-compressor.png" },
    { title: "Bearing Technology And Service", provider: "NSK", year: "2024", category: "reliability", image: "assets/images/certificates/nsk-bearing.png" },
    
    // --- Oil & Gas ---
    { title: "Refinery Fundamentals Program for Postgraduates", provider: "EPROM", year: "2023", category: "oil-gas", image: "assets/images/certificates/EPROM - Refinery Fundamentals Program.png" },
    
    // --- Aerospace / Automotive ---
    { title: "Satellite Structure Subsystem", provider: "Egyptian Space Agency", year: "2021", category: "aerospace", image: "assets/images/certificates/Egyptian Space Agency - Satellite Structure Subsystem Training.png" },
    { title: "First Rank: Mechanics Teams", provider: "Egyptian Space Agency", year: "2021", category: "aerospace", image: "assets/images/certificates/Egyptian Space Agency - First Rank Mechanics Team.png" },
    { title: "Best Member Powertrain: Formula Student UK'21", provider: "ASU Racing Team", year: "2021", category: "aerospace", image: "assets/images/certificates/ASU Racing Team - Formula Student UK 2021 Best Member.png" },
    
    // --- Computer Science & Programming ---
    { title: "CS50x: Introduction to Computer Science", provider: "Harvard University", year: "2020", category: "programming", image: "assets/images/certificates/CS50 Harvard - CS50x Introduction to Computer Science.png" },
    { title: "CS50's Introduction to Artificial Intelligence with Python", provider: "Harvard University", year: "2020", category: "programming", image: "assets/images/certificates/CS50 Harvard - Introduction to Artificial Intelligence with Python.png" },
    { title: "Become a Software Developer", provider: "LinkedIn Learning", year: "2021", category: "programming", image: "assets/images/certificates/LinkedIn Learning - Become a Software Developer.png" },
    { title: "Learning Python", provider: "LinkedIn Learning", year: "2021", category: "programming", image: "assets/images/certificates/LinkedIn Learning - Learning Python.png" },
    { title: "Learning C#", provider: "LinkedIn Learning", year: "2021", category: "programming", image: "assets/images/certificates/LinkedIn Learning - Learning C#.png" },
    { title: "Learning SQL Programming", provider: "LinkedIn Learning", year: "2021", category: "programming", image: "assets/images/certificates/LinkedIn Learning - Learning SQL Programming (2017).png" },
    { title: "Programming Foundations: Databases", provider: "LinkedIn Learning", year: "2021", category: "programming", image: "assets/images/certificates/LinkedIn Learning - Programming Foundations Databases.png" },
    
    // --- Management, Design & Innovation ---
    { title: "Project Management Foundations: Teams", provider: "LinkedIn Learning", year: "2021", category: "design", image: "assets/images/certificates/LinkedIn Learning - Project Management Foundations Teams.png" },
    { title: "Become a Graphic Designer", provider: "LinkedIn Learning", year: "2021", category: "design", image: "assets/images/certificates/LinkedIn Learning - Become a Graphic Designer.png" },
    { title: "innovegypt Program", provider: "ITIDA & TIEC", year: "2021", category: "design", image: "assets/images/certificates/ITIDA TIEC innovegypt - Innovation Training Course.png" },
    { title: "Reimagining the Future of Learning", provider: "Aspire Learning Space", year: "2021", category: "design", image: "assets/images/certificates/Aspire Learning Space - Reimagining the Future of Learning.png" }
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

  skills: [
    { name: "Reliability & Condition Monitoring", value: 92 },
    { name: "Rotating Equipment", value: 90 },
    { name: "Vibration Analysis", value: 85 },
    { name: "Energy Systems & Thermodynamics", value: 88 },
    { name: "Python / MATLAB / Data Analysis", value: 82 },
    { name: "Mechanical / MEP Design", value: 80 }
  ],

  tools: [
    "Python","MATLAB","Octave","C++ / Java","VBA","AI / Machine Learning",
    "ANSYS","SolidWorks","AutoCAD","Revit MEP","Inventor",
    "Aspen Plus","HOMER Pro","EnergyPLAN","WANDA",
    "LabVIEW","PLC / Ladder Logic","Primavera P6","Excel"
  ]
};
