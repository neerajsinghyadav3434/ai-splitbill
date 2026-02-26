"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategorySelector({ categories, onChange }) {
  const [selectedCategory, setSelectedCategory] = useState("");

  // Handle when a category is selected
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);

    // Only call onChange if it exists and the value has changed
    if (onChange && categoryId !== selectedCategory) {
      onChange(categoryId);
    }
  };

  // If no categories or empty categories array
  if (!categories || categories.length === 0) {
    return <div>No categories available</div>;
  }

  // Set default value if not already set
  if (!selectedCategory && categories.length > 0) {
    // Find a default category or use the first one
    const defaultCategory =
      categories.find((cat) => cat.isDefault) || categories[0];

    // Set the default without triggering a re-render loop
    setTimeout(() => {
      setSelectedCategory(defaultCategory.id);
      if (onChange) {
        onChange(defaultCategory.id);
      }
    }, 0);
  }

  return (
    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
      <SelectTrigger className="w-full h-11 border-gray-300 focus:border-violet-500 focus:ring-violet-500">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <SelectItem
              key={category.id}
              value={category.id}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-4 w-4 text-gray-600" />}
                <span>{category.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
