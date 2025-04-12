const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure the uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Function to extract text from PDF
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "";
  }
};

// Function to parse resume text
const parseResumeText = (text) => {
  const nameMatch = text.match(/Name[:\-]?\s*(.+)/i);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  const educationMatch = text.match(/(Bachelor|Master|B\.Sc|M\.Sc|B\.Tech|M\.Tech|Ph\.D).+/gi);
  const experienceMatch = text.match(/(?:(?:\d{4})|(?:\d+\s+years?)).*?(experience|worked|at)/gi);
  const skillsMatch = text.match(/Skills[:\-]?\s*(.+)/i);

  return {
    name: nameMatch ? nameMatch[1].trim() : "Not found",
    email: emailMatch ? emailMatch[0] : "Not found",
    phone: phoneMatch ? phoneMatch[0] : "Not found",
    education: educationMatch || [],
    experience: experienceMatch || [],
    skills: skillsMatch ? skillsMatch[1].split(/,|·|\n/).map(s => s.trim().toLowerCase()) : [],
  };
};

// Predefined job-related skills
const jobSkills = [
  "javascript", "react", "node.js", "express", "mongodb",
  "html", "css", "python", "django", "machine learning",
  "data structures", "algorithms", "typescript", "docker", "aws"
];

// Resource mapping
const resources = {
  javascript: {
    course: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
    video: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
  },
  react: {
    course: "https://reactjs.org/learn",
    video: "https://www.youtube.com/watch?v=bMknfKXIFA8",
  },
  "node.js": {
    course: "https://www.codecademy.com/learn/learn-node-js",
    video: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
  },
  express: {
    course: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs",
    video: "https://www.youtube.com/watch?v=L72fhGm1tfE",
  },
  mongodb: {
    course: "https://learn.mongodb.com/",
    video: "https://www.youtube.com/watch?v=Of1JrZbY4TQ",
  },
  html: {
    course: "https://www.w3schools.com/html/",
    video: "https://www.youtube.com/watch?v=UB1O30fR-EE",
  },
  css: {
    course: "https://www.w3schools.com/css/",
    video: "https://www.youtube.com/watch?v=yfoY53QXEnI",
  },
  python: {
    course: "https://www.learnpython.org/",
    video: "https://www.youtube.com/watch?v=rfscVS0vtbw",
  },
  django: {
    course: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django",
    video: "https://www.youtube.com/watch?v=F5mRW0jo-U4",
  },
  "machine learning": {
    course: "https://www.coursera.org/learn/machine-learning",
    video: "https://www.youtube.com/watch?v=Gv9_4yMHFhI",
  },
  "data structures": {
    course: "https://www.geeksforgeeks.org/data-structures/",
    video: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
  },
  algorithms: {
    course: "https://www.khanacademy.org/computing/computer-science/algorithms",
    video: "https://www.youtube.com/watch?v=rL8X2mlNHPM",
  },
  typescript: {
    course: "https://www.typescriptlang.org/docs/",
    video: "https://www.youtube.com/watch?v=d56mG7DezGs",
  },
  docker: {
    course: "https://www.docker.com/101-tutorial/",
    video: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
  },
  aws: {
    course: "https://aws.amazon.com/training/",
    video: "https://www.youtube.com/watch?v=ulprqHHWlng",
  }
};

// Upload & Analyze Resume
app.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "uploads", req.file.filename);
  const extractedText = await extractTextFromPDF(filePath);
  const parsedData = parseResumeText(extractedText);

  // Match Skills
  const matchedSkills = parsedData.skills.filter(skill =>
    jobSkills.includes(skill.toLowerCase())
  );

  const matchScore = Math.round((matchedSkills.length / jobSkills.length) * 100);

  // Feedback & Suggestions
  let feedback = "";
  if (matchScore >= 80) {
    feedback = "Great job! Your resume matches the job requirements well.";
  } else if (matchScore >= 50) {
    feedback = "Good effort! You might improve your resume by adding or highlighting more relevant skills.";
  } else {
    feedback = "Your resume has low relevance to the job role. Consider adding more relevant skills and projects.";
  }

  // Missing skills and resources
  const missingSkills = jobSkills.filter(js =>
    !parsedData.skills.includes(js.toLowerCase())
  );

  const recommendedResources = missingSkills.map(skill => ({
    skill,
    ...resources[skill] || {},
  }));

  // Final response
  res.json({
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
    extractedText,
    parsedData,
    extractedSkills: parsedData.skills,
    matchedSkills,
    matchScore,
    feedback,
    suggestions: missingSkills,
    recommendedResources,
  });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
