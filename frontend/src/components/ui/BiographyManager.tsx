import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

const biographies = [
  {
    id: 1,
    title: "AI Life Story",
    author: "Jane Doe",
    image: "/images/ai-life-story.jpg",
    synopsis:
      "A compelling look into the evolution of artificial intelligence and its pioneers.",
    exportLink: "/exports/ai-life-story.pdf",
  },
  {
    id: 2,
    title: "Coder Journey",
    author: "John Smith",
    image: "/images/coder-journey.jpg",
    synopsis:
      "An inspiring biography of a programmer who changed the world with code.",
    exportLink: "/exports/coder-journey.pdf",
  },
];

const BiographyCard = ({ bio }) => {
  return (
    <div className="group relative w-full max-w-sm bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="h-64 overflow-hidden">
        <img
          src={bio.image}
          alt={bio.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-1">
          {bio.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4">by {bio.author}</p>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
            <Eye size={16} /> View Biography
          </Button>
          <a href={bio.exportLink} download>
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
              <Download size={16} /> Export
            </Button>
          </a>
        </div>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white text-sm">{bio.synopsis}</p>
      </div>
    </div>
  );
};

export default function BiographyCardList() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 p-4">
      {biographies.map((bio) => (
        <BiographyCard key={bio.id} bio={bio} />
      ))}
    </div>
  );
}
