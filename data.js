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

  // Oil & Gas
  {
    title: "Refinery Fundamentals Program for Postgraduates",
    provider: "EPROM",
    year: "2023",
    category: "oil-gas",
    image: "assets/images/certificates/eprom-refinery-fundamentals.png"
  },

  // Aerospace
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

  // Computation & AI
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

  // Design & Management
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

  skills: [
    { name: "Field Engineering (Maintenance & Reliability)", value: 92 },
    { name: "Rotating Equipment", value: 90 },
    { name: "Vibration Analysis", value: 85 },
    { name: "Energy Systems & Thermodynamics", value: 88 },
    { name: "Computation (Python / MATLAB / AI)", value: 82 },
    { name: "Mechanical / MEP Design", value: 80 }
  ],

  tools: [
    "Python", "MATLAB", "Octave", "C++ / Java", "VBA", "AI / Machine Learning",
    "ANSYS", "SolidWorks", "AutoCAD", "Revit MEP", "Inventor",
    "Aspen Plus", "HOMER Pro", "EnergyPLAN", "WANDA",
    "LabVIEW", "PLC / Ladder Logic", "Primavera P6", "Excel"
  ]
};
