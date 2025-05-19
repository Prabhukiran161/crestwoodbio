"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/FormSection";
import { FormField } from "@/components/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { getAuthHeaders } from "@/utils/authHeaders";

const Introduction = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    place_of_birth_country: "",
    place_of_birth_city: "",
    father_name: "",
    mother_name: "",
    parents_unknown: false,
    sibling_count: 0,
    sibling_names: "",
    additional_info: "",
    voice_file: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/introduction`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (res.ok) {
        const { data } = await res.json();
        setFormData({
          ...data,
          date_of_birth: data.date_of_birth?.slice(0, 10) || "",
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error fetching introduction:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      parents_unknown: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/introduction`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        toast.success(
          `Introduction ${isEditing ? "updated" : "saved"} successfully!`
        );
        fetchData();
      } else {
        toast.error("Failed to submit introduction");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error while submitting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto border-none shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#1E3D58] to-[#057DCD] text-white">
            <CardTitle className="text-2xl font-bold text-center">
              Personal Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormSection title="Basic Information">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name || ""}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    label="Place of Birth - Country"
                    name="place_of_birth_country"
                    value={formData.place_of_birth_country || ""}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Place of Birth - City"
                    name="place_of_birth_city"
                    value={formData.place_of_birth_city || ""}
                    onChange={handleChange}
                  />
                </div>
              </FormSection>

              <FormSection title="Family Information">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    label="Father's Name"
                    name="father_name"
                    value={formData.father_name || ""}
                    onChange={handleChange}
                    disabled={formData.parents_unknown}
                  />
                  <FormField
                    label="Mother's Name"
                    name="mother_name"
                    value={formData.mother_name || ""}
                    onChange={handleChange}
                    disabled={formData.parents_unknown}
                  />
                </div>
                <div className="flex items-center space-x-2 my-4">
                  <Checkbox
                    id="parents_unknown"
                    checked={formData.parents_unknown}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor="parents_unknown"
                    className="text-sm font-medium"
                  >
                    Parents Unknown
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    label="Number of Siblings"
                    name="sibling_count"
                    type="number"
                    value={formData.sibling_count}
                    onChange={handleChange}
                    min="0"
                  />
                  <FormField
                    label="Sibling Names (comma-separated)"
                    name="sibling_names"
                    value={formData.sibling_names || ""}
                    onChange={handleChange}
                    disabled={formData.sibling_count <= 0}
                  />
                </div>
              </FormSection>

              <FormSection title="Additional Information">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="additional_info"
                      className="text-sm font-medium"
                    >
                      Additional Info
                    </label>
                    <Textarea
                      id="additional_info"
                      name="additional_info"
                      value={formData.additional_info || ""}
                      onChange={handleChange}
                      className="min-h-[120px]"
                      placeholder="Share any additional information about yourself here..."
                    />
                  </div>
                  <FormField
                    label="Voice File Name (Optional)"
                    name="voice_file"
                    value={formData.voice_file || ""}
                    onChange={handleChange}
                  />
                </div>
              </FormSection>

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  className="bg-[#057DCD] hover:bg-[#036bb3] text-white px-8 py-2 rounded-md transition-colors w-full md:w-auto"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Processing..."
                    : isEditing
                    ? "Update Introduction"
                    : "Save Introduction"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Introduction;
