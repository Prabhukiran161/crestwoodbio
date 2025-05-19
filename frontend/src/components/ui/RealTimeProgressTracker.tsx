"use client";

import { Mic, FileText, Eye, BookOpenCheck, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress"; 
import { useState } from "react";

const RealTimeProgressTracker = () => {
  const [selectedProject, setSelectedProject] = useState("AI Life Story");

  const projects = [
    "AI Life Story",
    "Memoirs of a Dancer",
    "My Father’s Legacy",
  ];

  const progressData = [
    {
      title: "Recording",
      icon: <Mic className="text-blue-500" size={28} />,
      percentage: 100,
      action: "Continue Recording",
    },
    {
      title: "Transcription",
      icon: <FileText className="text-purple-500" size={28} />,
      percentage: 80,
      action: "Edit Transcript",
    },
    {
      title: "Editor Review",
      icon: <Eye className="text-yellow-500" size={28} />,
      percentage: 40,
      action: "Review Comments",
    },
    {
      title: "Publish",
      icon: <BookOpenCheck className="text-green-500" size={28} />,
      percentage: 0,
      action: "Schedule Publication",
    },
  ];

  return (
    <div className="shadow-md rounded-xl bg-white p-4 space-y-4">
      <div className="flex justify-between items-center">
        
        <div className="relative inline-block w-48">
          <select
            className="appearance-none w-full bg-[#E8EEF1] text-[#1E3D58] border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map((project, idx) => (
              <option key={idx}>{project}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute top-2.5 right-2 text-gray-500 pointer-events-none"
            size={16}
          />
        </div>
      </div>

      <div className="space-y-4">
        {progressData.map((stage, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="bg-[#E8EEF1] p-2 rounded-full shadow-md">
              {stage.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-medium text-[#1E3D58]">{stage.title}</p>
                <span className="text-sm text-gray-500">
                  {stage.percentage}% complete
                </span>
              </div>
              <Progress
                className="h-2 mt-2"
                value={stage.percentage}
                indicatorClassName={
                  stage.percentage === 100
                    ? "bg-green-500"
                    : stage.percentage >= 50
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }
              />
              <button className="text-sm mt-1 text-[#057DCD] hover:underline">
                {stage.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeProgressTracker;
