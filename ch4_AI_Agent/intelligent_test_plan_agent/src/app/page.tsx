"use client";

import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { SetupStep } from "@/components/planner/SetupStep";
import { FetchIssuesStep } from "@/components/planner/FetchIssuesStep";
import { ReviewStep } from "@/components/planner/ReviewStep";
import { TestPlanStep } from "@/components/planner/TestPlanStep";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  // States for Payload B.L.A.S.T
  const [llmConfig, setLlmConfig] = useState({
    provider: "Ollama",
    baseUrl: "http://localhost:11434",
    apiKey: "",
    modelName: "llama3",
    status: "untested", // untested, success, error
  });

  const [jiraConfig, setJiraConfig] = useState({
    name: "My Jira Connection",
    url: "https://your-domain.atlassian.net",
    email: "",
    token: "",
  });

  const [fetchConfig, setFetchConfig] = useState({
    productName: "",
    projectKey: "",
    sprint: "",
    issueKeys: "",
    context: "",
  });

  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [reviewNotes, setReviewNotes] = useState("");
  const [testPlan, setTestPlan] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 1, title: "1. Setup" },
    { id: 2, title: "2. Fetch User Story" },
    { id: 3, title: "3. Review" },
    { id: 4, title: "4. Test Plan" },
  ];

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const savedLlm = localStorage.getItem("ai_test_llm");
    if (savedLlm) setLlmConfig(JSON.parse(savedLlm));
    const savedJira = localStorage.getItem("ai_test_jira");
    if (savedJira) setJiraConfig(JSON.parse(savedJira));
  }, []);

  // Save to local storage when updating
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("ai_test_llm", JSON.stringify(llmConfig));
      localStorage.setItem("ai_test_jira", JSON.stringify(jiraConfig));
    }
  }, [llmConfig, jiraConfig, mounted]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  
  const handleReset = () => {
    setIssuesList([]);
    setSelectedIssues(new Set());
    setTestPlan("");
    setReviewNotes("");
    setFetchConfig({ ...fetchConfig, context: "" });
    setCurrentStep(1);
  };

  const handleTestPlanGenerated = (planData: string) => {
    setTestPlan(planData);
    // Save to history automatically
    try {
      const existingHistory = JSON.parse(localStorage.getItem("ai_test_history") || "[]");
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        project: fetchConfig.projectKey || "Manual Scope",
        plan: planData
      };
      localStorage.setItem("ai_test_history", JSON.stringify([newEntry, ...existingHistory].slice(0, 20))); // Keep last 20
    } catch(e) {}
  };

  if (!mounted) return null; // Prevent hydration mismatch Flash

  return (
    <div className="flex min-h-screen bg-background text-foreground flex-col">
      <div className="flex flex-1 flex-col">
        <TopHeader />
        
        {/* Main Workspace */}
        <main className="flex-1 p-6 flex flex-col items-center">
          
          <div className="w-full max-w-5xl">
            {/* Stepper Header */}
            <div className="flex flex-wrap items-center justify-between mb-8 opacity-90 pb-4 border-b gap-y-4">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  onClick={() => {
                    if (step.id > currentStep) {
                      if (step.id === 2 && !jiraConfig.token) return;
                      // if we jump to 3 we need issues
                      if (step.id === 3 && issuesList.length === 0) return;
                      if (step.id === 4 && !testPlan) return;
                    }
                    setCurrentStep(step.id);
                  }}
                  className={`flex flex-col items-center transition-opacity cursor-pointer select-none hover:opacity-100 flex-1 min-w-[80px] ${
                    currentStep === step.id ? "opacity-100 text-primary" : "opacity-50"
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-semibold tracking-wide text-center ${
                    currentStep === step.id ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                  <div className={`mt-2 h-1.5 rounded-full transition-all w-[90%] sm:w-full ${
                    currentStep >= step.id ? "bg-primary" : "bg-muted"
                  }`}></div>
                </div>
              ))}
            </div>

            {/* Stepper Content */}
            <div className="mt-8">
              {currentStep === 1 && (
                <SetupStep 
                  llmConfig={llmConfig} 
                  setLlmConfig={setLlmConfig}
                  jiraConfig={jiraConfig}
                  setJiraConfig={setJiraConfig}
                  onNext={handleNext} 
                />
              )}
              {currentStep === 2 && (
                <FetchIssuesStep 
                  jiraConfig={jiraConfig}
                  fetchConfig={fetchConfig}
                  setFetchConfig={setFetchConfig}
                  issuesList={issuesList}
                  setIssuesList={setIssuesList}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <ReviewStep 
                  issuesList={issuesList}
                  selectedIssues={selectedIssues}
                  setSelectedIssues={setSelectedIssues}
                  reviewNotes={reviewNotes}
                  setReviewNotes={setReviewNotes}
                  onNext={handleNext}
                  onBack={handleBack}
                  setTestPlan={handleTestPlanGenerated}
                  setIsGenerating={setIsGenerating}
                />
              )}
              {currentStep === 4 && (
                <TestPlanStep 
                  testPlan={testPlan}
                  isGenerating={isGenerating}
                  onBack={handleBack}
                  onReset={handleReset}
                  projectName={fetchConfig.productName || fetchConfig.projectKey || "project"}
                />
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
