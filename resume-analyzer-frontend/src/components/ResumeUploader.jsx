"use client"

import { useState } from "react"
import axios from "axios"
import { UploadCloud } from "lucide-react"

const Card = ({ children }) => (
  <div
    style={{
      padding: "1.5rem",
      backgroundColor: "white",
      borderRadius: "1rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "42rem",
    }}
  >
    {children}
  </div>
)

const Button = ({ children, disabled, onClick, style = {} }) => (
  <button
    style={{
      padding: "0.5rem 1rem",
      backgroundColor: disabled ? "#93c5fd" : "#3b82f6",
      color: "white",
      borderRadius: "0.25rem",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background-color 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      width: "100%",
      border: "none",
      ...style,
    }}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
)

const ResumeUploader = () => {
  const [file, setFile] = useState(null)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("resume", file)

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Server response:", res.data)
      console.log("Recommended resources:", res.data.recommendedResources)

      setResponse({
        ...res.data,
        fileUrl: `http://localhost:5000${res.data.filePath}`,
      })
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "#f3f4f6",
      }}
    >
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            AI Resume Analyzer
          </h1>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "0.25rem",
              padding: "0.5rem",
              width: "100%",
            }}
          />

          <Button onClick={handleUpload} disabled={!file || loading}>
            <UploadCloud size={18} />
            {loading ? "Uploading..." : "Upload Resume"}
          </Button>

          {/* Debug Information */}
          {response && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#e5e7eb",
                color: "#111827",
                borderRadius: "0.25rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2 style={{ fontWeight: "600", fontSize: "1.125rem" }}>Debug Information:</h2>
              <p>Has recommendedResources: {response.recommendedResources ? "Yes" : "No"}</p>
              <p>Number of resources: {response.recommendedResources?.length || 0}</p>
              <pre
                style={{
                  fontSize: "0.75rem",
                  marginTop: "0.5rem",
                  backgroundColor: "white",
                  padding: "0.5rem",
                  borderRadius: "0.25rem",
                  overflow: "auto",
                  maxHeight: "10rem",
                }}
              >
                {JSON.stringify(response.recommendedResources, null, 2)}
              </pre>
            </div>
          )}

          {response && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#dcfce7",
                color: "#14532d",
                borderRadius: "0.25rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* Match Score */}
              <div>
                <h2 style={{ fontWeight: "600", fontSize: "1.125rem" }}>Match Score: {response.matchScore}%</h2>
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#d1d5db",
                    borderRadius: "0.25rem",
                    height: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#16a34a",
                      height: "0.75rem",
                      borderRadius: "0.25rem",
                      width: `${response.matchScore}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <h2 style={{ fontWeight: "600", fontSize: "1.125rem" }}>Feedback:</h2>
                <p>{response.feedback}</p>
              </div>

              {/* Suggestions */}
              {response.suggestions && response.suggestions.length > 0 && (
                <div>
                  <h2 style={{ fontWeight: "600", fontSize: "1.125rem" }}>Suggestions to Improve:</h2>
                  <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
                    {response.suggestions.map((sugg, idx) => (
                      <li key={idx}>{sugg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Resources */}
              {response.recommendedResources && response.recommendedResources.length > 0 && (
                <div>
                  <h2 style={{ fontWeight: "600", fontSize: "1.125rem" }}>Recommended Resources:</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {response.recommendedResources.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "white",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: "600",
                            textTransform: "capitalize",
                            color: "#1d4ed8",
                          }}
                        >
                          {item.skill}
                        </p>
                        <div
                          style={{
                            marginLeft: "1rem",
                            marginTop: "0.25rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                          }}
                        >
                          {item.course && (
                            <div>
                              <span style={{ fontWeight: "500" }}>Course:</span>{" "}
                              <a
                                href={item.course}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#2563eb",
                                  textDecoration: "none",
                                  wordBreak: "break-all",
                                }}
                                onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                                onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                              >
                                {item.course}
                              </a>
                            </div>
                          )}
                          {item.video && (
                            <div>
                              <span style={{ fontWeight: "500" }}>Video:</span>{" "}
                              <a
                                href={item.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#2563eb",
                                  textDecoration: "none",
                                  wordBreak: "break-all",
                                }}
                                onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                                onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                              >
                                {item.video}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Skills */}
              <div>
                <h2 style={{ fontWeight: "600" }}>Extracted Skills:</h2>
                <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
                  {response.extractedSkills?.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
              </div>

              {/* Matched Skills */}
              <div>
                <h2 style={{ fontWeight: "600" }}>Matched Job Skills:</h2>
                <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
                  {response.matchedSkills?.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
              </div>

              {/* Parsed Resume Details */}
              {response.parsedData && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <h2 style={{ fontWeight: "600", fontSize: "1.125rem" }}>Parsed Resume Details:</h2>
                  <p>
                    <span style={{ fontWeight: "600" }}>Name:</span> {response.parsedData.name}
                  </p>
                  <p>
                    <span style={{ fontWeight: "600" }}>Email:</span> {response.parsedData.email}
                  </p>
                  <p>
                    <span style={{ fontWeight: "600" }}>Phone:</span> {response.parsedData.phone}
                  </p>

                  {/* Education */}
                  {response.parsedData.education.length > 0 && (
                    <div>
                      <p style={{ fontWeight: "600" }}>Education:</p>
                      <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
                        {response.parsedData.education.map((edu, idx) => (
                          <li key={idx}>{edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Experience */}
                  {response.parsedData.experience.length > 0 && (
                    <div>
                      <p style={{ fontWeight: "600" }}>Experience:</p>
                      <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
                        {response.parsedData.experience.map((exp, idx) => (
                          <li key={idx}>{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Resume File Link */}
              {response.fileUrl && (
                <div>
                  <p style={{ fontWeight: "600" }}>Resume Saved At:</p>
                  <a
                    href={response.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "underline",
                      wordBreak: "break-all",
                    }}
                  >
                    {response.fileUrl}
                  </a>
                </div>
              )}

              {/* Extracted Text */}
              {response.extractedText && (
                <div>
                  <h2 style={{ fontWeight: "600" }}>Extracted Text:</h2>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      maxHeight: "10rem",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      backgroundColor: "white",
                      padding: "0.5rem",
                      borderRadius: "0.25rem",
                    }}
                  >
                    {response.extractedText}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ResumeUploader
