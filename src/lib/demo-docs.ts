import type { BuilderResult } from "./schemas";
import type { DocSlug } from "./doc-meta";

export const DEMO_DOCS: Record<DocSlug, BuilderResult> = {
  resume: {
    document_type: "resume",
    personal: {
      fullName: "Alex Morgan",
      headline: "Senior Full-Stack Software Engineer",
      email: "alex.morgan.tech@email.com",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      website: "https://alexmorgan.dev",
      github: "https://github.com/alexmorgan",
      linkedin: "https://linkedin.com/in/alexmorgan-eng",
    },
    sections: {
      summary:
        "Full-Stack Software Engineer with 6+ years of experience designing scalable microservices, resilient distributed systems, and modern web applications. Proven track record leading cloud architecture migrations that cut infrastructure costs by 28% and reduced P99 latency by 35%. Passionate about clean code, test automation, and developer ergonomics.",
      skills: [
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "Go",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Kubernetes",
        "AWS (ECS, Lambda, S3)",
        "GraphQL",
        "REST APIs",
        "CI/CD Pipelines",
        "Jest",
        "Microservices",
        "System Design",
      ],
      experience: [
        {
          title: "Senior Full-Stack Engineer",
          organization: "Stripe",
          startDate: "Jan 2022",
          endDate: "",
          period: "Jan 2022 – Present",
          bullets: [
            "Architected real-time merchant analytics dashboard serving 2M+ active merchants, reducing query latency by 42%.",
            "Led migration of core billing microservices to TypeScript and containerized infrastructure, boosting deployment frequency 3x.",
            "Engineered automated idempotency middleware preventing duplicate payment submissions under high network concurrency.",
            "Mentored 6 junior and mid-level engineers through structured code reviews and bi-weekly system design workshops.",
          ],
        },
        {
          title: "Software Engineer",
          organization: "Twilio",
          startDate: "Jun 2019",
          endDate: "Dec 2021",
          period: "Jun 2019 – Dec 2021",
          bullets: [
            "Developed high-throughput customer messaging API endpoints processing over 120M monthly transactions with 99.99% uptime.",
            "Created automated integration test suites that increased code coverage from 64% to 92% across 8 production repositories.",
            "Collaborated with security teams to implement end-to-end payload encryption and achieve SOC 2 Type II compliance.",
          ],
        },
        {
          title: "Junior Web Developer",
          organization: "Acme Cloud Solutions",
          startDate: "Aug 2017",
          endDate: "May 2019",
          period: "Aug 2017 – May 2019",
          bullets: [
            "Built responsive React dashboards and internal tooling used by 450+ internal customer support specialists.",
            "Optimized client-side bundle size by 35% through dynamic code splitting and tree-shaking.",
          ],
        },
      ],
      education: [
        {
          credential: "B.S. in Computer Science",
          institution: "University of California, Berkeley",
          startDate: "2013",
          endDate: "2017",
          period: "2013 – 2017",
        },
      ],
      certifications: [
        {
          name: "AWS Certified Solutions Architect – Associate",
          issuer: "Amazon Web Services",
          period: "2023",
        },
      ],
      languages: [
        { language: "English", proficiency: "Native / Bilingual" },
        { language: "Spanish", proficiency: "Professional Working" },
      ],
      extra: [
        {
          type: "Project",
          title: "OpenTelemetry Node.js Contributor",
          organization: "CNCF",
          period: "2023 – Present",
          details:
            "Contributed performance optimization patches to OpenTelemetry tracing instrumentation packages with 500k+ weekly downloads.",
        },
      ],
    },
  },

  cv: {
    document_type: "cv",
    personal: {
      fullName: "Dr. Elena Vance",
      headline: "Postdoctoral Research Fellow in Distributed Computing & Machine Learning",
      email: "e.vance@cs.mit.edu",
      phone: "+1 (617) 555-0192",
      location: "Cambridge, MA",
      website: "https://elenavance.mit.edu",
      github: "https://github.com/elena-vance",
      linkedin: "https://linkedin.com/in/elena-vance-phd",
    },
    sections: {
      summary:
        "Computer Science Researcher specializing in scalable distributed consensus protocols and privacy-preserving federated learning systems. Author of 12 peer-reviewed publications in top conferences (OSDI, SOSP, NSDI) with $450,000 in funded competitive research grants. Dedicated educator with 5+ years of graduate and undergraduate instruction experience.",
      skills: [
        "Distributed Systems",
        "Consensus Protocols (Paxos, Raft, PBFT)",
        "Federated Machine Learning",
        "C++",
        "Rust",
        "Python",
        "PyTorch",
        "Formal Verification (TLA+)",
        "Linux Kernel Internals",
        "Network Protocol Design",
        "Academic Publishing",
        "Grant Writing",
      ],
      experience: [
        {
          title: "Postdoctoral Research Fellow",
          organization: "MIT Computer Science and Artificial Intelligence Laboratory (CSAIL)",
          startDate: "Sep 2023",
          endDate: "",
          period: "Sep 2023 – Present",
          bullets: [
            "Pioneered asynchronous Byzantine-fault-tolerant consensus mechanism for edge networks, achieving 3.2x throughput increase.",
            "Co-principal investigator on NSF grant ($350K) investigating privacy guarantees in decentralized model training.",
            "Co-supervised 4 Ph.D. students and taught graduate-level Advanced Distributed Systems (6.824).",
          ],
        },
        {
          title: "Graduate Research Assistant",
          organization: "University of Oxford, Department of Computer Science",
          startDate: "Oct 2019",
          endDate: "Jun 2023",
          period: "Oct 2019 – Jun 2023",
          bullets: [
            "Conducted theoretical and empirical research on decentralized consensus protocols under adversarial partitions.",
            "Authored doctoral dissertation awarded the British Computer Society Distinguished Dissertation Award nomination.",
            "Collaborated with European industrial partners to test resilient consensus models on testbeds spanning 14 countries.",
          ],
        },
      ],
      education: [
        {
          credential: "Ph.D. in Computer Science",
          institution: "University of Oxford",
          startDate: "2019",
          endDate: "2023",
          period: "2019 – 2023",
        },
        {
          credential: "M.Sc. in Computer Science with Distinction",
          institution: "ETH Zurich",
          startDate: "2017",
          endDate: "2019",
          period: "2017 – 2019",
        },
        {
          credential: "B.Sc. in Mathematics and Computer Science",
          institution: "University of Edinburgh",
          startDate: "2013",
          endDate: "2017",
          period: "2013 – 2017",
        },
      ],
      certifications: [
        {
          name: "Fellow of the Higher Education Academy (FHEA)",
          issuer: "Advance HE",
          period: "2023",
        },
      ],
      languages: [
        { language: "English", proficiency: "Native / Bilingual" },
        { language: "German", proficiency: "Fluent" },
        { language: "French", proficiency: "Intermediate / Conversational" },
      ],
      extra: [
        {
          type: "Publication",
          title: "Asynchronous Resilient State Machine Replication for Heterogeneous Edge Clusters",
          organization: "USENIX Symposium on Operating Systems Design and Implementation (OSDI)",
          period: "2024",
          details:
            "First author. Introduced novel quorum protocol reducing cross-datacenter message complexity by 38%.",
        },
        {
          type: "Grant",
          title: "NSF Cyber-Physical Systems Core Grant #2319401 ($350,000)",
          organization: "National Science Foundation",
          period: "2023 – 2026",
          details:
            "Co-PI investigating decentralized model updates in high-latency wireless networks.",
        },
      ],
      references: [
        {
          name: "Prof. Martin Rinard",
          title: "Professor of Computer Science",
          organization: "MIT CSAIL",
          email: "rinard@csail.mit.edu",
          phone: "+1 (617) 253-0000",
          relationship: "Postdoctoral Research Advisor",
        },
        {
          name: "Prof. Marta Kwiatkowska",
          title: "Professor of Computing Systems",
          organization: "University of Oxford",
          email: "marta.kwiatkowska@cs.ox.ac.uk",
          phone: "+44 1865 273838",
          relationship: "Doctoral Dissertation Advisor",
        },
      ],
      attachments: [
        "Official Doctoral Transcripts (University of Oxford)",
        "Letters of Recommendation (2)",
        "Selected Publications (OSDI 2024, PODC 2023)",
      ],
      cover_letter: `Elena Rostova, Ph.D.

Cambridge, MA 02139 | +1 (617) 555-0182 | elena.rostova.cs@email.com | https://linkedin.com/in/elena-rostova-cs

October 5, 2026

Dear Hiring Team,

I am applying for the Senior Distributed Systems Researcher role at Quantum Systems. I am a Postdoctoral Research Fellow with 6 years in distributed consensus and fault-tolerant computing, with proven evidence of authoring peer-reviewed OSDI papers and co-principal investigator experience on a $350K NSF grant.

In my current role at MIT CSAIL, I pioneered an asynchronous Byzantine-fault-tolerant consensus protocol for edge clusters that delivered a 3.2x throughput increase across 50 simulated geo-distributed nodes. Before that, I completed doctoral research at Oxford developing partition-tolerant coordination primitives that were stress-tested across 14 European institutional testbeds. Both map directly to your requirement for designing resilient, large-scale distributed architectures.

I have followed Quantum Systems' recent release of your asynchronous ledger engine, and I am especially excited by your approach to sub-millisecond edge finality without centralized sequencers.

I would welcome the chance to talk about your consensus benchmarks and distributed architecture goals. Thank you for your time.

Sincerely,

Elena Rostova, Ph.D.`,
    },
  },

  "cover-letter": {
    document_type: "cover_letter",
    personal: {
      fullName: "Marcus Vance",
      headline: "Lead Technical Product Manager",
      email: "marcus.vance.pm@email.com",
      phone: "+1 (206) 555-0144",
      location: "Seattle, WA",
      website: "https://marcusvance.me",
      github: "",
      linkedin: "https://linkedin.com/in/marcusvance-techpm",
    },
    sections: {
      summary:
        "Application for Lead Technical Product Manager — Payments Infrastructure at Stripe.",
      skills: [
        "Product Strategy",
        "API Design & Developer Experience",
        "Go-To-Market Execution",
        "Financial Technology & Payments",
        "Cross-Functional Leadership",
      ],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
      attachments: [
        "Product Portfolio & Architecture Whitepaper",
        "References Available Upon Request",
      ],
      cover_letter: `Marcus Vance

Seattle, WA | +1 (206) 555-0144 | marcus.vance.pm@email.com | https://linkedin.com/in/marcusvance-techpm

October 5, 2026

Dear Stripe Hiring Team,

I am applying for the Lead Technical Product Manager role for Payments Infrastructure at Stripe. I am a Staff Product Manager with 7 years in developer platforms and high-frequency financial transaction infrastructure, with proven evidence of scaling API products from zero to $65M+ ARR and reducing developer integration time by 45%.

In my current role at AWS Cloud Platform, I lead core developer SDK infrastructure where we re-architected critical transaction endpoints to lift 90-day integration retention from 71% to 89%. Before that, at Datadog, I spearheaded third-party ecosystem integrations delivering 12 mission-critical integrations ahead of schedule. Both map directly to your requirement for dependable developer ergonomics, API reliability, and foundational financial plumbing.

Stripe's mission to increase the GDP of the internet aligns with my belief that financial software should be as dependable, fast, and simple as electricity.

I would welcome the chance to talk about Stripe's payments engineering roadmap and API scaling goals. Thank you for your time.

Sincerely,

Marcus Vance`,
      extra: [
        {
          type: "Paragraph",
          title: "Opening & Alignment",
          organization: "",
          period: "",
          details:
            "I am applying for the Lead Technical Product Manager role for Payments Infrastructure at Stripe. I am a Staff Product Manager with 7 years in developer platforms and high-frequency financial transaction infrastructure, with proven evidence of scaling API products from zero to $65M+ ARR and reducing developer integration time by 45%.",
        },
        {
          type: "Paragraph",
          title: "Core Qualifications & Impact",
          organization: "",
          period: "",
          details:
            "In my current role at AWS Cloud Platform, I lead core developer SDK infrastructure where we re-architected critical transaction endpoints to lift 90-day integration retention from 71% to 89%. Before that, at Datadog, I spearheaded third-party ecosystem integrations delivering 12 mission-critical integrations ahead of schedule. Both map directly to your requirement for dependable developer ergonomics, API reliability, and foundational financial plumbing.",
        },
        {
          type: "Paragraph",
          title: "Why Stripe",
          organization: "",
          period: "",
          details:
            "Stripe's mission to increase the GDP of the internet aligns with my belief that financial software should be as dependable, fast, and simple as electricity.",
        },
        {
          type: "Paragraph",
          title: "Closing & Next Steps",
          organization: "",
          period: "",
          details:
            "I would welcome the chance to talk about Stripe's payments engineering roadmap and API scaling goals. Thank you for your time.",
        },
      ],
    },
  },
};
