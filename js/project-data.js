/**
 * RODDNEIL B. GEMINA — PROJECT CATALOG & ARCHITECTURAL DATA
 * Full-fidelity data source for all 12 engineering case studies.
 * Keyed by ID ('p1', 'p2', etc.) and slug ('fusion-rush', etc.)
 */
(function(global) {
  'use strict';

  const projects = {
    p1: {
      id: 'p1',
      slug: 'fusion-rush',
      order: 1,
      title: 'ICETT 2026: Fusion Rush AI Reasoning Tutor',
      subtitle: 'Scopus-Indexed Conference Paper (ICETT 2026, Singapore)',
      badge: "Scopus '26 Author",
      category: 'AI Research & Systems',
      categoryTag: 'research web',
      year: '2025–2026',
      status: 'Accepted & Published (Singapore)',
      role: 'Lead Algorithm Architect & Full-Stack Researcher',
      venue: '14th International Conference on Educational and Information Technology (ICETT 2026, Singapore)',
      authors: 'F.M.F.G. Bascug, R.B. Gemina, B.X. Mendoza, Engr. R. Laviste, Prof. C. Arellano',
      image: 'images/fusionrush.jpg',
      video: 'images/FusionRushDemo.mp4',
      orientation: 'landscape',
      oneLiner: 'Adaptive, gamified AI reasoning tutor transforming formal discrete mathematics proof derivation into interactive cognitive challenges with instant AST-level logical validation.',
      problem: 'In foundational computer science, students consistently struggle with abstract deductive inference rules (modus ponens, hypothetical syllogism, resolution, de Morgan’s laws) and formal proof construction. Traditional paper-based grading creates an opaque feedback loop where students wait days for feedback and cannot diagnose at which inference step their derivation diverged, resulting in cognitive disengagement and high attrition rates in discrete mathematics courses.',
      solution: 'To eliminate this pedagogical bottleneck, Fusion Rush was engineered as an adaptive, gamified AI reasoning tutor. The platform breaks down complex predicate logic proofs into sequential, game-like theorem puzzle graphs. An internal AST parser verifies proof validity at every state transition, while an adaptive hint engine detects fallacies, provides contextual justifications, and dynamically adjusts level complexity based on student problem-solving velocity.',
      keyHighlights: [
        {
          title: 'Sub-10ms AST Validation Engine',
          desc: 'Custom propositional logic parser evaluating student deduction steps in real-time against formal mathematical transformation rules with zero lag.'
        },
        {
          title: 'Scopus-Indexed Academic Acceptance',
          desc: 'Peer-reviewed and accepted by the ICETT 2026 committee in Singapore as an innovative educational technology contribution in computing education.'
        },
        {
          title: 'Adaptive Cognitive Scaffolding',
          desc: 'Dynamic difficulty adjustment algorithm analyzing error frequencies to serve contextual hints without giving away theorem solutions.'
        },
        {
          title: 'Interactive Node-Graph Visualizer',
          desc: 'Visual proof graph mapping inference trees to make abstract symbolic logic tangible and intuitive for undergraduate students.'
        }
      ],
      techStack: [
        'Python 3.11',
        'FastAPI',
        'Custom AST Parser',
        'AI Reasoning Engine',
        'Discrete Mathematics',
        'HTML5 / CSS3 / ES6',
        'Docker',
        'LaTeX Pipeline'
      ],
      techCategorized: {
        languages: ['Python 3.11', 'JavaScript (ES6+)', 'HTML5 / Modern CSS'],
        frameworks: ['FastAPI', 'Tailwind CSS', 'Uvicorn'],
        systems: ['Discrete Math AST Parser', 'AI Hint Generator', 'Rule Graph Validator'],
        infrastructure: ['Docker', 'Linux VM', 'LaTeX Publishing Workflow']
      },
      metrics: [
        { label: 'Publication', value: "ICETT '26", detail: 'Scopus-Indexed (Singapore)' },
        { label: 'Validation Latency', value: '< 10ms', detail: 'Real-time AST inference' },
        { label: 'Formal Rules', value: '24+ Rules', detail: 'Propositional & Predicate' },
        { label: 'Role', value: 'Lead', detail: 'Architecture & Full-Stack' }
      ],
      links: [
        { label: 'Conference Acceptance', url: 'https://icett.org/', type: 'external' }
      ]
    },

    p2: {
      id: 'p2',
      slug: 'visual-ai',
      order: 2,
      title: 'PCSC 2026: Visual AI Logic Proof Parser',
      subtitle: '26th Philippine Computing Science Congress Presentation',
      badge: "PCSC '26 Presenter",
      category: 'Computer Vision & AI',
      categoryTag: 'research web',
      year: '2026',
      status: 'National Congress Presentation',
      role: 'Lead Computer Vision Researcher & Congress Presenter',
      venue: '26th Philippine Computing Science Congress (PCSC 2026, Davao City)',
      authors: 'F.M.F.G. Bascug, R.B. Gemina, B.X. Mendoza, Prof. C. Arellano',
      image: 'images/visualai.jpg',
      orientation: 'landscape',
      oneLiner: 'Computer vision OCR pipeline scanning, digitizing, and scoring handwritten discrete math proofs using an abstract syntax tree inference checker.',
      problem: 'Manual verification and grading of student handwritten discrete math proofs is time-consuming, prone to human inconsistency, and provides delayed feedback. Off-the-shelf OCR engines routinely fail on handwritten mathematical notation due to ambiguous superscripts, non-standard handwriting, and complex line-by-line justification structures.',
      solution: 'Delivered a high-accuracy visual parsing pipeline using OpenCV pre-processing and PyTorch-based OCR integrated with an AST-based logical rule verification engine. The system scans student handwritten proofs, extracts mathematical symbol tokens, constructs an inference dependency graph, and executes automated verification with partial-credit scoring.',
      keyHighlights: [
        {
          title: 'National Congress Presentation',
          desc: 'Presented empirical research findings to leading computer science scholars across the Philippines at PCSC 2026 in Davao City.'
        },
        {
          title: 'Robust Math OCR Pre-Processing',
          desc: 'OpenCV pipeline applying adaptive thresholding, contour segmentation, and baseline normalization for clear mathematical symbol extraction.'
        },
        {
          title: 'Formal AST Inference Verification',
          desc: 'Extracted tokens are parsed into an Abstract Syntax Tree verifying mathematical deductions against formal propositional truth systems.'
        },
        {
          title: 'Automated Granular Scoring',
          desc: 'Provides automated partial credit by evaluating the exact line where a student proof diverged from valid inference rules.'
        }
      ],
      techStack: [
        'Python',
        'OpenCV',
        'PyTorch',
        'OCR Tokenizer',
        'AST Parser',
        'Flask',
        'NumPy',
        'Scikit-Learn'
      ],
      techCategorized: {
        languages: ['Python 3.10', 'C++ / OpenCV Bindings'],
        vision: ['OpenCV', 'PyTorch', 'Contour Segmentation', 'OCR Pipeline'],
        reasoning: ['AST Proof Checker', 'Formal Proposition Verification'],
        services: ['Flask API', 'NumPy', 'SciPy']
      },
      metrics: [
        { label: 'Conference', value: "PCSC '26", detail: 'National Congress (Davao)' },
        { label: 'Grading Time', value: '-85%', detail: 'Compared to manual audit' },
        { label: 'OCR Domain', value: 'Symbolic Math', detail: 'Logic glyph specialization' },
        { label: 'Scoring', value: 'Granular', detail: 'Step-by-step partial credit' }
      ],
      links: [
        { label: 'PCSC 2026 Congress', url: 'https://csp.org.ph/pcsc2026', type: 'external' }
      ]
    },

    p13: {
      id: 'p13',
      slug: 'resutex',
      order: 3,
      title: 'ResuTex: Autonomous ATS Resume Studio & Compiler',
      subtitle: 'Autonomous ATS Resume Studio & Compiler paired with Gemini 3.8 Flash',
      badge: 'Autonomous ATS Studio',
      category: 'AI Tooling & Compilers',
      categoryTag: 'research web',
      year: '2026',
      status: 'Production Ready',
      role: 'Creator & Lead AI Engineer',
      venue: 'Autonomous Resume Engineering Platform',
      image: 'images/resutex.png',
      orientation: 'landscape',
      oneLiner: 'Autonomous split-screen resume studio generating 100% ATS-parsable single-column LaTeX resumes with sub-second Python ReportLab compilation and Gemini 3.8 Flash bullet polish.',
      problem: 'Modern job applicants get rejected by ATS parsers due to invisible formatting artifacts, complex table grids, and non-standard layouts generated by generic rich-text editors. Conversely, standard LaTeX tools have steep compilation overhead, slow cloud render loops, and require complex syntax mastery.',
      solution: 'Delivered an autonomous split-screen studio generating single-column Harvard/MIT standard resumes with zero formatting artifacts, sub-second Python compilation, and Gemini 3.8 Flash bullet polish. Users edit a clean structured schema while seeing real-time compilation without formatting drift.',
      keyHighlights: [
        {
          title: 'Sub-450ms Native Python Compiler',
          desc: 'High-speed ReportLab PDF compilation pipeline generating compliant documents with zero rendering drift.'
        },
        {
          title: '100% ATS Parsability Guarantee',
          desc: 'Single-column standardized typography strictly compliant with corporate applicant tracking systems.'
        },
        {
          title: 'Gemini 3.8 Flash Intelligence',
          desc: 'Integrated Google Gemini 3.8 Flash intelligence for automated bullet metric polish, impact verbs, and keyword alignment.'
        },
        {
          title: 'Split-Screen Live Synchronizer',
          desc: 'Reactive split view updating document layout on keystrokes with instant PDF export and schema import.'
        }
      ],
      techStack: [
        'Python',
        'ReportLab Compiler',
        'Gemini 3.8 Flash',
        'LaTeX Generation',
        'AST Schema Parser',
        'Figma Design System',
        'REST APIs'
      ],
      techCategorized: {
        languages: ['Python', 'JavaScript (ES6+)', 'Modern CSS'],
        ai: ['Gemini 3.8 Flash', 'Prompt Engineering', 'Semantic Keyword Calibration'],
        rendering: ['ReportLab Compiler Engine', 'LaTeX Typography Standards'],
        architecture: ['Client-Server API', 'Sub-second Pipeline']
      },
      metrics: [
        { label: 'ATS Parsability', value: '100%', detail: 'Single-column Harvard/MIT standard' },
        { label: 'Compile Time', value: '<450ms', detail: 'Instant sub-second PDF generation' },
        { label: 'Intelligence', value: 'Gemini 3.8', detail: 'Semantic metric enhancement' },
        { label: 'Formatting Drift', value: '0px', detail: 'Strict programmatic layout' }
      ],
      links: []
    },

    p12: {
      id: 'p12',
      slug: 'aicquire',
      order: 4,
      title: 'aicquire: AI-Powered Applicant Tracking System',
      subtitle: 'Modern AI-Native HR Tech & Candidate Matching Platform',
      badge: 'Enterprise SaaS',
      category: 'Enterprise SaaS & AI',
      categoryTag: 'research web',
      year: '2026',
      status: 'Cloud Platform Prototype',
      role: 'QA Analyst and Tester',
      venue: 'Enterprise Talent Acquisition Suite',
      image: 'images/aicquire.png',
      orientation: 'landscape',
      oneLiner: 'AI-native recruitment platform featuring 94% candidate match scoring, multi-stage drag-and-drop Kanban hiring pipelines, and automated interview scheduling workflows.',
      problem: 'Recruiting teams are overwhelmed by thousands of unstructured applicant resumes, resulting in sluggish hiring cycles, recruiter burnout, and missed top-tier talent. Keyword searches fail on synonyms, while disconnected spreadsheets cause high candidate drop-off.',
      solution: 'Built an AI-native applicant tracking system with 94% semantic candidate match scoring, multi-stage drag-and-drop Kanban hiring boards, and automated interview scheduling workflows. Recruiters gain instant visual clarity across job openings and candidates.',
      keyHighlights: [
        {
          title: '94% Semantic Candidate Scoring',
          desc: 'Vector embeddings analyze applicant experience against job requirements, outperforming naive keyword filters.'
        },
        {
          title: 'Interactive Multi-Stage Kanban',
          desc: 'Fluid drag-and-drop hiring pipelines updating candidate status with instant feedback and stage telemetry.'
        },
        {
          title: 'Recruitment Telemetry Dashboard',
          desc: 'Analytics tracking time-to-hire, funnel conversion, and source attribution across active requisitions.'
        },
        {
          title: 'Automated Interview Workflows',
          desc: 'Integrated scheduling triggers and communication templates reducing administrative overhead.'
        }
      ],
      techStack: [
        'React',
        'TypeScript',
        'Node.js',
        'PostgreSQL',
        'AI Matching Engine',
        'NLP / Embeddings',
        'Kanban Pipelines',
        'REST APIs'
      ],
      techCategorized: {
        frontend: ['React', 'TypeScript', 'Tailwind CSS', 'Drag & Drop API'],
        backend: ['Node.js', 'Express', 'PostgreSQL'],
        ai: ['Vector Embeddings', 'Semantic Similarity Scoring', 'NLP Parsing'],
        infrastructure: ['RESTful Architecture', 'Cloud Services']
      },
      metrics: [
        { label: 'Match Accuracy', value: '94%', detail: 'Semantic relevance score' },
        { label: 'Screening Time', value: '-70%', detail: 'Automated candidate ranking' },
        { label: 'Pipeline', value: 'Kanban', detail: 'Real-time drag-and-drop' },
        { label: 'Architecture', value: 'Cloud-Ready', detail: 'Scalable PostgreSQL schema' }
      ],
      links: []
    },

    p9: {
      id: 'p9',
      slug: 'refertoire',
      order: 5,
      title: 'Refertoire: Ensemble Repertoire Syncing App',
      subtitle: 'Freelance Offline-First PWA & Android Application for Choral Ensembles',
      badge: 'Client Shipped PWA',
      category: 'Offline Systems & Mobile',
      categoryTag: 'web mobile',
      year: '2025–2026',
      status: 'Shipped to Client & In Active Use',
      role: 'Lead Full-Stack Engineer & Audio Tech Architect',
      venue: 'Professional Vocal & Instrumental Ensembles',
      image: 'images/refertoire.png',
      orientation: 'landscape',
      oneLiner: 'Resilient 100% offline-first repertoire manager for vocal ensembles and instrumentalists, featuring an in-app package installer, squish-free dual-container PDF reader, and instant sync.',
      problem: 'Choral ensembles and orchestras frequently perform in remote acoustic venues lacking dependable Wi-Fi, leaving musicians stranded when digital music scores fail to load or download. Generic PDF viewers distort sheet music aspect ratios, cutting off musical staffs and lyrics.',
      solution: 'Provided a resilient offline-first PWA and Android package with an in-app package installer, squish-free dual-container PDF reader, instant sync, and Bluetooth foot-pedal page turning support. Operates 100% offline with zero cloud dependency during live stage performances.',
      keyHighlights: [
        {
          title: '100% Offline-First Architecture',
          desc: 'Service Workers and IndexedDB cache entire choral libraries locally, ensuring instant access during performances.'
        },
        {
          title: 'Squish-Free Sheet Music Engine',
          desc: 'Custom dual-container rendering pipeline that guarantees musical engravings maintain strict aspect ratios without distortion.'
        },
        {
          title: 'Bluetooth Foot Pedal Navigation',
          desc: 'Integrated Web Bluetooth and HID keyboard listener for hands-free page turning via wireless foot controllers.'
        },
        {
          title: 'In-App Package Installer',
          desc: 'Enables conductors to bundle and distribute new seasonal music repertoires with single-click package installation.'
        }
      ],
      techStack: [
        'Offline-First',
        'PWA',
        'Android APK',
        'IndexedDB',
        'Service Workers',
        'PDF.js',
        'Web Bluetooth API',
        'Tailwind CSS'
      ],
      techCategorized: {
        offline: ['Service Workers', 'IndexedDB', 'Cache API', 'PWA Manifest'],
        rendering: ['PDF.js Engine', 'Custom Dual-Container Canvas', 'Hardware Acceleration'],
        hardware: ['Web Bluetooth API', 'HID Foot Pedal Protocol'],
        frontend: ['Vanilla ESNext', 'Tailwind CSS', 'Android TWA Packaging']
      },
      metrics: [
        { label: 'Offline Availability', value: '100%', detail: 'Zero dependence on venue Wi-Fi' },
        { label: 'Page Turn Speed', value: '<50ms', detail: 'Pre-cached memory buffers' },
        { label: 'Platforms', value: 'PWA + APK', detail: 'Tablet and mobile deployment' },
        { label: 'Score Distortion', value: '0%', detail: 'Dual-container aspect preservation' }
      ],
      links: []
    },

    p10: {
      id: 'p10',
      slug: 'gigipos',
      order: 6,
      title: 'GigiPOS: Modern Multi-Branch Retail Platform',
      subtitle: 'Enterprise Retail POS SaaS Managing 120+ Distributed Branches',
      badge: 'Production SaaS',
      category: 'Enterprise SaaS & Cloud',
      categoryTag: 'web',
      year: '2025–2026',
      status: 'Production Architecture',
      role: 'QA Analyst and Tester',
      venue: 'Enterprise Retail Multi-Store Infrastructure',
      image: 'images/gigipos.png',
      orientation: 'landscape',
      oneLiner: 'High-throughput retail management platform managing 120+ branches with a 35s average checkout time, 99.9% uptime SLA, automated stock synchronization, and unified analytics.',
      problem: 'Retail businesses operating across multiple brick-and-mortar branches suffer from fragmented inventory records, slow checkout bottlenecks, and lack of real-time multi-branch visibility. Concurrent sales across stores lead to stock overselling and accounting reconciliation nightmares.',
      solution: 'Architected an ultra-fast point of sale platform supporting 120+ branches with a 35s average checkout speed, 99.9% uptime SLA, and real-time branch synchronization using Redis transaction locking and PostgreSQL database partitioning.',
      keyHighlights: [
        {
          title: 'Sub-35s Checkout Throughput',
          desc: 'High-efficiency touch-first cashier interface designed for high-concurrency peak store hours.'
        },
        {
          title: 'Distributed Inventory Locking',
          desc: 'Redis-backed distributed lock protocol preventing concurrent overselling across 120+ physical branches.'
        },
        {
          title: 'Multi-Tenant Analytics Engine',
          desc: 'Real-time sales velocity graphs, inventory restock alerts, and automated end-of-day register reconciliation.'
        },
        {
          title: 'Offline Resilient Register',
          desc: 'Local transaction queuing that automatically flushes to the cloud upon connection recovery.'
        }
      ],
      techStack: [
        'React',
        'Node.js',
        'PostgreSQL',
        'Multi-Branch Sync',
        'Redis',
        'REST APIs',
        'Cloud Architecture'
      ],
      techCategorized: {
        frontend: ['React', 'Zustand State', 'Tailwind CSS', 'Touch POS Interface'],
        backend: ['Node.js', 'Express', 'PostgreSQL', 'Redis Distributed Locks'],
        architecture: ['Multi-Branch Sync Protocol', 'Transaction Queuing'],
        cloud: ['Docker', 'AWS / Cloud Hosting', '99.9% Uptime Architecture']
      },
      metrics: [
        { label: 'Average Checkout', value: '35s', detail: 'Touch transaction workflow' },
        { label: 'Branch Capacity', value: '120+', detail: 'Multi-branch simultaneous sync' },
        { label: 'Uptime SLA', value: '99.9%', detail: 'Resilient high-availability' },
        { label: 'Inventory Drift', value: 'Real-Time', detail: 'Redis transaction lock protocol' }
      ],
      links: []
    },

    p11: {
      id: 'p11',
      slug: 'whatswap',
      order: 7,
      title: 'WhatSwap?!: Dynamic P2P Barter & Auction Marketplace',
      subtitle: 'Real-Time P2P Item Barter & Bid Negotiation Marketplace',
      badge: 'WebSockets Platform',
      category: 'Marketplaces & WebSockets',
      categoryTag: 'web',
      year: '2025',
      status: 'Interactive Web Platform',
      role: 'Full-Stack Engineer & Systems Designer',
      venue: 'P2P Barter & Real-Time Auctions',
      image: 'images/whatswap.png',
      orientation: 'landscape',
      oneLiner: 'Interactive trade and auction marketplace featuring real-time bi-directional socket bidding, peer-to-peer item barter negotiations, and secure transaction escrow verification.',
      problem: 'Traditional e-commerce platforms force users into pure monetary transactions, leaving collectors and traders without a trusted ecosystem for item-to-item barter and dynamic bidding. Existing community trade forums suffer from rampant fraud and lack transactional escrow.',
      solution: 'Engineered an interactive trade and auction marketplace featuring multi-party barter negotiations, real-time socket bidding, and verified escrow transaction security. Users can propose item-for-item trades with cash differential top-offs in a structured state machine.',
      keyHighlights: [
        {
          title: 'Sub-30ms WebSocket Auction Bidding',
          desc: 'Bi-directional real-time socket room synchronization with dynamic anti-sniping auction countdown timers.'
        },
        {
          title: 'Multi-Item Barter State Machine',
          desc: 'Structured trade negotiation workflow allowing users to bundle items, propose counter-offers, and verify mutual terms.'
        },
        {
          title: 'Escrow Security Pipeline',
          desc: 'Milestone-based transaction security verifying item authenticity and tracking physical handoffs.'
        },
        {
          title: 'Responsive Dark UI Showcase',
          desc: 'Immersive product catalog designed for rapid browsing, real-time notifications, and mobile interactions.'
        }
      ],
      techStack: [
        'WebSockets',
        'Socket.IO',
        'Node.js',
        'Express',
        'PostgreSQL',
        'P2P Barter Logic',
        'JavaScript (ES6+)'
      ],
      techCategorized: {
        frontend: ['Vanilla ESNext', 'HTML5', 'CSS3 Modern Grid', 'Socket.IO Client'],
        realtime: ['WebSockets', 'Event-Driven Message Dispatch', 'Auction Timer Loop'],
        backend: ['Node.js', 'Express', 'PostgreSQL'],
        logic: ['Barter State Machine', 'Escrow Audit Protocol']
      },
      metrics: [
        { label: 'Bid Latency', value: '<30ms', detail: 'Real-time WebSocket sync' },
        { label: 'Trade Modes', value: 'Dual Engine', detail: 'P2P Barter + Live Auctions' },
        { label: 'Security', value: 'Escrow Logic', detail: 'Multi-step trade validation' },
        { label: 'Architecture', value: 'Event-Driven', detail: 'Decoupled socket queues' }
      ],
      links: []
    },

    p8: {
      id: 'p8',
      slug: 'nexchef',
      order: 8,
      title: 'Nexchef: Live Step Cooking & Recipe Platform',
      subtitle: 'Freelance Mobile Application with Concurrent Culinary Step Timers',
      badge: 'Mobile Client App',
      category: 'Mobile & Ergonomics',
      categoryTag: 'web mobile',
      year: '2024–2025',
      status: 'Shipped Mobile Prototype',
      role: 'Mobile Architect & UI/UX Lead',
      venue: 'Mobile Culinary Technology',
      image: 'images/nexchef.png',
      orientation: 'portrait',
      oneLiner: 'Interactive mobile culinary interface featuring concurrent recipe step timers, audio milestone prompts, and community recipe fork trees designed for hands-free kitchen ergonomics.',
      problem: 'Home cooks struggle to juggle multiple recipe timers while following written instructions with messy hands, leading to overcooked food and frustrating culinary workflows. Traditional apps require constant physical touching and lock up single timer threads.',
      solution: 'Designed an intuitive mobile culinary interface featuring concurrent recipe step timers, audio milestone alerts, and interactive community recipe fork trees. The UI uses high-contrast typography readable from across the kitchen counter.',
      keyHighlights: [
        {
          title: 'Concurrent Step Timer Engine',
          desc: 'Simultaneous background timer threads tracking prep, simmer, and bake stages with zero thread collision.'
        },
        {
          title: 'Hands-Free Kitchen Ergonomics',
          desc: 'High-contrast typography and large touch targets engineered for viewing at arm’s length in steamy kitchens.'
        },
        {
          title: 'Recipe Fork Trees',
          desc: 'Interactive recipe branching allowing home cooks to customize spice profiles, portions, and cooking methods.'
        },
        {
          title: 'Audio Milestone Guidance',
          desc: 'Spoken audio prompts and distinct chimes notifying cooks when crucial preparation steps are reached.'
        }
      ],
      techStack: [
        'React Native / Mobile UI',
        'TypeScript',
        'Concurrent Timers',
        'Audio APIs',
        'UI/UX Design',
        'Figma Mobile System'
      ],
      techCategorized: {
        mobile: ['React Native / Mobile UI', 'TypeScript', 'Expo Mobile Framework'],
        audio: ['Web Audio API', 'Background Push Alerts', 'Synthesized Speech'],
        design: ['Kitchen Ergonomic Design', 'High-Contrast Typography', 'Figma Design System']
      },
      metrics: [
        { label: 'Concurrent Timers', value: '5+ Active', detail: 'Simultaneous background threads' },
        { label: 'Type Legibility', value: 'Counter-Scale', detail: 'Readable from 4+ feet away' },
        { label: 'Audio Cues', value: 'Milestones', detail: 'Hands-free progress awareness' },
        { label: 'Recipe Cache', value: 'Offline-First', detail: 'Zero kitchen interruption' }
      ],
      links: []
    },

    p3: {
      id: 'p3',
      slug: 'takeit',
      order: 9,
      title: 'TakeIt: Event Management & Cryptographic QR Ticketing',
      subtitle: 'Freelance Web App & Fraud-Proof Digital Event Ticketing Platform',
      badge: 'Client Web App',
      category: 'FinTech & Event Systems',
      categoryTag: 'web',
      year: '2024',
      status: 'Shipped to Event Organizers',
      role: 'Full-Stack Developer & Security Designer',
      venue: 'Event Ticketing & Venue Admissions',
      image: 'images/takeit.png',
      orientation: 'portrait',
      oneLiner: 'Scalable event ticketing platform eliminating intermediary booking commissions through signed cryptographic QR passes, offline-capable gate scanners, and real-time revenue analytics.',
      problem: 'Local event organizers face high intermediary ticketing commission fees (10–15%) and clunky manual badge validation at entry gates that collapses when cellular reception fails in crowded venues.',
      solution: 'Delivered a scalable direct-to-consumer ticketing web application featuring instant cryptographic QR ticket generation, real-time ticket scanning, and financial reporting with an offline-capable entrance scanner.',
      keyHighlights: [
        {
          title: 'HMAC Signed Cryptographic QR',
          desc: 'Digitally signed attendee tickets preventing ticket duplication, counterfeit passes, and fraudulent reselling.'
        },
        {
          title: 'Sub-150ms Offline Gate Scanner',
          desc: 'High-speed camera scanner verifying admissions locally against pre-synced hashes during peak entrance rushes.'
        },
        {
          title: '0% Intermediary Fee Architecture',
          desc: 'Direct organizer revenue collection eliminating third-party ticketing markups.'
        },
        {
          title: 'Live Organizer Telemetry',
          desc: 'Real-time admissions dashboard tracking entrance throughput, peak arrival times, and revenue figures.'
        }
      ],
      techStack: [
        'React',
        'Node.js',
        'Express',
        'PostgreSQL',
        'QR Verification',
        'HMAC Cryptography',
        'REST APIs'
      ],
      techCategorized: {
        frontend: ['React', 'CSS Modules', 'Camera QR Scanner Engine'],
        backend: ['Node.js', 'Express', 'PostgreSQL'],
        security: ['HMAC Digital Signatures', 'Cryptographic Tokenization'],
        analytics: ['Real-Time Admissions Dashboard', 'CSV Export Engine']
      },
      metrics: [
        { label: 'Gate Scan Time', value: '<150ms', detail: 'High-speed entrance validation' },
        { label: 'Security', value: 'HMAC Signed', detail: 'Zero duplicate admissions' },
        { label: 'Commission Fee', value: '0%', detail: 'Direct organizer revenue model' },
        { label: 'Reliability', value: 'Offline-Ready', detail: 'Cached ticket hash table' }
      ],
      links: []
    },

    p4: {
      id: 'p4',
      slug: 'dishcover',
      order: 10,
      title: 'DishCover: Smart Pantry & Food Expiration Tracker',
      subtitle: 'Household Food Waste Reduction & Dynamic Leftover Recipe Engine',
      badge: 'Pantry App',
      category: 'Sustainability & Web App',
      categoryTag: 'web mobile',
      year: '2024',
      status: 'Shipped Web App',
      role: 'Frontend Architect & UI Designer',
      venue: 'Household Sustainability Tools',
      image: 'images/dishcover.png',
      orientation: 'portrait',
      oneLiner: 'Intelligent household pantry management web application preventing grocery waste via automated shelf-life tracking and dynamic leftover recipe matching algorithms.',
      problem: 'Households waste hundreds of dollars each month throwing away expired groceries due to poor visibility into pantry inventory, often forgetting perishable items until spoiled.',
      solution: 'Created an intelligent grocery tracking web application featuring color-coded freshness indicators, automated expiry alerts, and a recommendation algorithm that queries recipe databases based on ingredients already available in the pantry.',
      keyHighlights: [
        {
          title: 'Automated Shelf-Life Radar',
          desc: 'Visual expiration indicators categorizing pantry goods by urgency to prompt immediate consumption.'
        },
        {
          title: 'Dynamic Recipe Matcher',
          desc: 'Inverted-index algorithm querying culinary databases to prioritize ingredients expiring soonest.'
        },
        {
          title: 'Instant Local Persistence',
          desc: 'Zero-friction client-side storage allowing immediate item entry without mandatory account creation.'
        },
        {
          title: 'One-Handed Mobile Ergonomics',
          desc: 'Tactile UI designed for quick item logging while unpacking grocery bags with one hand.'
        }
      ],
      techStack: [
        'JavaScript (ES6+)',
        'HTML5',
        'CSS3',
        'Local Storage API',
        'Notification APIs',
        'Inverted Index Matching'
      ],
      techCategorized: {
        frontend: ['Vanilla JavaScript', 'HTML5 Semantic Elements', 'CSS3 Modern Grid'],
        storage: ['LocalStorage API', 'IndexedDB Persistence'],
        logic: ['Ingredient Matching Algorithm', 'Expiry Timeline Engine']
      },
      metrics: [
        { label: 'Food Waste', value: '-35%', detail: 'Estimated household reduction' },
        { label: 'Recipe Match', value: 'Instant', detail: 'In-memory index filter' },
        { label: 'Offline Ready', value: '100%', detail: 'Local storage persistence' },
        { label: 'Latency', value: '<16ms', detail: 'Immediate client-side updates' }
      ],
      links: []
    },

    p5: {
      id: 'p5',
      slug: 'cropconnect',
      order: 11,
      title: 'CropConnect: Direct Farmer-to-Consumer Fresh Produce',
      subtitle: 'AgriTech E-Commerce Connecting Smallholder Farmers Directly to Buyers',
      badge: 'AgriTech Platform',
      category: 'AgriTech & Supply Chain',
      categoryTag: 'web',
      year: '2023–2024',
      status: 'Deployed Platform',
      role: 'Backend Lead & Full-Stack Developer',
      venue: 'Agricultural Supply Chain & Marketplace',
      image: 'images/cropconnect.png',
      orientation: 'portrait',
      oneLiner: 'Direct agricultural e-commerce platform connecting smallholder rural farmers with urban consumers, cutting intermediary costs and securing fair farm-gate pricing.',
      problem: 'Agricultural smallholders lose substantial margins to multi-layered middlemen while consumers face inflated prices for non-fresh produce due to complex broker chains.',
      solution: 'Architected a transparent direct-to-consumer marketplace with automated logistics scheduling, farm gate pricing transparency, and produce quality verification.',
      keyHighlights: [
        {
          title: 'Farm-Gate Price Transparency',
          desc: 'Live commodity price indexing ensuring farmers receive fair market compensation without broker cuts.'
        },
        {
          title: 'Consolidated Logistics Routing',
          desc: 'Aggregates harvest batches across regional smallholders into unified urban delivery dispatches.'
        },
        {
          title: 'Low-Bandwidth Mobile Optimization',
          desc: 'Ultra-lightweight web interface designed to load seamlessly over rural 3G cellular connections.'
        },
        {
          title: 'Relational Order Processing',
          desc: 'Structured database pipeline handling harvest schedules, produce grading, and payment escrows.'
        }
      ],
      techStack: [
        'PHP',
        'MySQL',
        'Django / Python',
        'Tailwind CSS',
        'REST APIs',
        'Logistics Routing'
      ],
      techCategorized: {
        backend: ['PHP / Django', 'MySQL Database', 'RESTful API Architecture'],
        frontend: ['HTML5', 'Tailwind CSS', 'JavaScript'],
        systems: ['Batch Logistics Router', 'Produce Pricing Index']
      },
      metrics: [
        { label: 'Farmer Margins', value: '+40%', detail: 'Elimination of intermediary fees' },
        { label: 'Payload Size', value: '<50KB', detail: 'Optimized for rural cellular access' },
        { label: 'Farm-to-Door', value: '<24h', detail: 'Rapid direct delivery transit' },
        { label: 'Transactions', value: 'Relational', detail: 'ACID-compliant inventory safety' }
      ],
      links: []
    },

    p6: {
      id: 'p6',
      slug: 'bomberman',
      order: 12,
      title: 'Bomberman BattleRoyale: Java Socket PvP Game',
      subtitle: 'Concurrent 4-Player LAN Battle Royale Engineered in Pure Java',
      badge: 'Java Systems Game',
      category: 'Systems & Network Programming',
      categoryTag: 'game',
      year: '2023',
      status: 'Academic Systems Project',
      role: 'Game Architect & Network Engineer',
      venue: 'Systems Engineering & Concurrency Showcase',
      image: 'images/bomberman.png',
      orientation: 'square',
      oneLiner: 'Concurrent 4-player LAN battle royale game engineered from scratch in Java with custom low-latency TCP/UDP socket synchronization, collision physics, and A* tile pathfinding.',
      problem: 'Engineering network games with concurrent client loops often encounters thread contention, desynchronized entity state, and packet stutter under jittery network conditions if sockets and game loop timing are not strictly managed.',
      solution: 'Demonstrated fundamental multithreaded systems programming and object-oriented design patterns by building a low-latency TCP/UDP client-server game with predictive arena shrinking and collision physics in pure Java without game engines.',
      keyHighlights: [
        {
          title: 'Deterministic 60 FPS Game Loop',
          desc: 'High-precision game loop timing with double-buffered rendering to prevent visual tearing.'
        },
        {
          title: 'Concurrent Client Socket Threads',
          desc: 'Custom binary serialization over TCP sockets ensuring sub-5ms LAN state synchronization.'
        },
        {
          title: 'Dynamic Shrinking Arena Mechanic',
          desc: 'Battle-royale boundary contraction pushing remaining players into close-quarters tactical combat.'
        },
        {
          title: 'Autonomous A* Bot AI',
          desc: 'Custom pathfinding algorithm computing real-time bomb blast evasion vectors and strategic tile navigation.'
        }
      ],
      techStack: [
        'Java (JDK 17)',
        'Multithreading',
        'Sockets (TCP/UDP)',
        'Java Swing / AWT',
        'A* Pathfinding',
        'OOP Design Patterns'
      ],
      techCategorized: {
        core: ['Java (JDK 17)', 'Multi-Threaded Architecture', 'OOP Design Patterns'],
        networking: ['Java Socket API (TCP/UDP)', 'Custom Binary Serialization', 'Thread Pools'],
        algorithms: ['A* Tile Pathfinding', '2D Bounding-Box Physics', 'Game Loop Synchronization']
      },
      metrics: [
        { label: 'Tick Rate', value: '60 FPS', detail: 'Deterministic loop timing' },
        { label: 'LAN Latency', value: '<5ms', detail: 'Low-overhead binary payloads' },
        { label: 'Concurrency', value: '4+ Players', detail: 'Thread-safe concurrent data structures' },
        { label: 'Dependencies', value: '0 External', detail: '100% Native Java Standard Library' }
      ],
      links: []
    },

    p14: {
      id: 'p14',
      slug: 'dxform',
      order: 13,
      title: 'DXForm PH Cloud: Enterprise Form & Workflow Engine',
      subtitle: 'Scalable Enterprise Workflow & Form Automation Platform',
      badge: 'Enterprise SaaS',
      category: 'Enterprise SaaS & Cloud',
      categoryTag: 'web',
      year: '2025–2026',
      status: 'Production Architecture',
      role: 'Software Engineer & Full-Stack Architect',
      venue: 'Enterprise Digital Transformation Suite',
      image: 'images/dxform-logo.webp',
      orientation: 'landscape',
      oneLiner: 'Next-generation enterprise dynamic form builder and workflow automation engine for government and corporate digitalization with granular schema validation and role-based ACLs.',
      problem: 'Complex administrative paper and legacy PDF forms result in data collection errors, stalled approvals, and expensive manual data entry across departments.',
      solution: 'Engineered a schema-driven dynamic form engine and workflow automation platform with multi-tenant access control, encrypted document storage, and real-time audit logging.',
      keyHighlights: [
        {
          title: 'Dynamic JSON Schema Engine',
          desc: 'Real-time client/server schema validation with custom conditional logic and validation pipelines.'
        },
        {
          title: 'Multi-Tenant RBAC',
          desc: 'Role-based access controls with end-to-end departmental permission hierarchies.'
        },
        {
          title: 'Instant Workflow Automations',
          desc: 'Webhook triggers and automated status transitions reducing turnaround time by 60%.'
        }
      ],
      techStack: [
        'React',
        'TypeScript',
        'Node.js',
        'PostgreSQL',
        'Docker',
        'Redis',
        'JSON Schema'
      ],
      techCategorized: {
        frontend: ['React', 'TypeScript', 'Tailwind CSS'],
        backend: ['Node.js', 'Express', 'PostgreSQL', 'Redis'],
        infrastructure: ['Docker', 'Cloud Hosting', 'REST APIs']
      },
      metrics: [
        { label: 'Processing Speed', value: '<100ms', detail: 'Dynamic form evaluation' },
        { label: 'Paper Reduction', value: '-85%', detail: 'Digital workflow transitions' },
        { label: 'Uptime SLA', value: '99.9%', detail: 'Containerized deployment' },
        { label: 'Security', value: 'RBAC', detail: 'Encrypted document pipeline' }
      ],
      links: []
    },

    p7: {
      id: 'p7',
      slug: 'e-tanom',
      order: 14,
      title: 'E-Tanom: Agricultural Supply Chain & Logistics PWA',
      subtitle: 'Localized Farm-to-Market Produce Trading & Inventory Management',
      badge: 'Supply Chain PWA',
      category: 'AgriTech & Mobile',
      categoryTag: 'web mobile',
      year: '2025',
      status: 'Field Prototype',
      role: 'Lead Full-Stack Developer',
      venue: 'Regional Agri-Logistics Infrastructure',
      image: 'images/etanom.jpg',
      orientation: 'landscape',
      oneLiner: 'Localized agro-logistics marketplace bridging smallholder farmers directly with wholesale buyers through transparent price discovery and route-optimized freight tracking.',
      problem: 'Rural produce farmers face asymmetric market pricing and middleman exploitation due to lack of real-time wholesale market information and inefficient freight logistics.',
      solution: 'Engineered a mobile-first PWA with offline inventory logging, live wholesale market price discovery, and multi-drop routing for regional harvest pickup.',
      keyHighlights: [
        {
          title: 'Offline-First Produce Logging',
          desc: 'Field-resilient Service Worker cache allowing farmers to log yield data with zero cellular signal.'
        },
        {
          title: 'Market Price Transparency',
          desc: 'Crowdsourced wholesale market indices protecting rural sellers from predatory margins.'
        },
        {
          title: 'Optimized Route Dispatch',
          desc: 'Multi-drop regional harvest collection minimizing fuel consumption and transport spoilage.'
        }
      ],
      techStack: [
        'PWA',
        'JavaScript',
        'IndexedDB',
        'Node.js',
        'Express',
        'Tailwind CSS'
      ],
      techCategorized: {
        frontend: ['Vanilla JavaScript', 'Tailwind CSS', 'PWA Manifest'],
        offline: ['IndexedDB', 'Service Workers', 'Cache API'],
        backend: ['Node.js', 'Express', 'SQLite']
      },
      metrics: [
        { label: 'Offline Sync', value: '100%', detail: 'Field data resilience' },
        { label: 'Farmer Margins', value: '+35%', detail: 'Direct wholesale connection' },
        { label: 'Payload', value: '<250KB', detail: 'Ultra-lightweight mobile footprint' },
        { label: 'Load Time', value: '<0.8s', detail: 'Instant edge caching' }
      ],
      links: []
    },

    p15: {
      id: 'p15',
      slug: 'ensemble-stage-sync',
      order: 15,
      title: 'Ensemble Stage Sync: Real-Time Audio Telemetry',
      subtitle: 'Stage Performance Audio Monitoring & Musician Cue Infrastructure',
      badge: 'Live Audio Metric',
      category: 'Audio Systems & Web',
      categoryTag: 'web mobile',
      year: '2026',
      status: 'Audio Lab Prototype',
      role: 'Audio Tech Engineer',
      venue: 'Live Performance Systems Lab',
      image: 'images/band.png',
      orientation: 'landscape',
      oneLiner: 'Ultra-low-latency stage audio telemetry system delivering real-time harmonic analysis, pitch accuracy metrics, and distributed conductor cues to musicians on stage.',
      problem: 'Acoustic latency and stage reverberation cause desynchronization between vocal sections and instrumental accompaniment during large venue performances.',
      solution: 'Built an in-browser Web Audio API telemetry engine measuring sub-10ms harmonic alignment, instantaneous pitch tracking, and networked conductor downbeat broadcasts.',
      keyHighlights: [
        {
          title: 'Web Audio FFT Pipeline',
          desc: 'High-speed hardware-accelerated Fast Fourier Transform audio spectrum analysis.'
        },
        {
          title: 'Sub-10ms Cue Broadcast',
          desc: 'Real-time WebSocket protocol syncing visual metronome cues across stage tablet arrays.'
        },
        {
          title: 'Interactive Harmonic Visualizer',
          desc: 'Canvas 2D frequency oscilloscope rendering dynamic frequency heatmaps at 60 FPS.'
        }
      ],
      techStack: [
        'Web Audio API',
        'FFT Analysis',
        'WebSockets',
        'Canvas 2D',
        'Vanilla JavaScript'
      ],
      techCategorized: {
        audio: ['Web Audio API', 'AudioContext', 'AnalyserNode', 'Fast Fourier Transform'],
        networking: ['WebSockets (WS/WSS)', 'BroadcastChannel API'],
        rendering: ['HTML5 Canvas 2D', 'requestAnimationFrame Loop', 'CSS Custom Properties']
      },
      metrics: [
        { label: 'Audio Latency', value: '<10ms', detail: 'Real-time FFT analysis' },
        { label: 'Sync Drift', value: '<2ms', detail: 'Distributed clock sync' },
        { label: 'Frame Rate', value: '60 FPS', detail: 'Hardware-accelerated rendering' },
        { label: 'Memory', value: '<30MB', detail: 'Zero memory leaks in audio loop' }
      ],
      links: []
    }
  };

  // Helper order array for Next/Previous project navigation
  const projectOrder = ['p1', 'p2', 'p13', 'p12', 'p9', 'p10', 'p11', 'p8', 'p3', 'p4', 'p5', 'p6', 'p14', 'p7', 'p15'];

  // Lookup map supporting both id ('p1') and slug ('fusion-rush')
  const lookup = {};
  projectOrder.forEach((id, index) => {
    const p = projects[id];
    p.prevId = projectOrder[(index - 1 + projectOrder.length) % projectOrder.length];
    p.nextId = projectOrder[(index + 1) % projectOrder.length];
    lookup[id.toLowerCase()] = p;
    lookup[p.slug.toLowerCase()] = p;
  });

  function getProject(query) {
    if (!query) return projects['p1'];
    const key = String(query).trim().toLowerCase();
    return lookup[key] || projects['p1'];
  }

  function getAllProjects() {
    return projectOrder.map(id => projects[id]);
  }

  // Export to global scope
  global.PortfolioProjects = {
    projects,
    projectOrder,
    getProject,
    getAllProjects
  };

})(typeof window !== 'undefined' ? window : this);
