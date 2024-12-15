"use client";

import React, { useState, useEffect } from "react";
import axios, { isAxiosError } from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Search, LoaderCircleIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SearchRecipes: React.FC = () => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const ingredientsRes = await axios.get("/api/ingredients");
        const categoriesRes = await axios.get("/api/categories");
        setIngredients(ingredientsRes?.data?.data);
        setCategories(categoriesRes?.data?.data);
      } catch (error: any) {
        console.error(error);
      }
    };
    fetchFilters();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/recipes", {
        params: {
          searchTerm,
          ingredient: selectedIngredient,
          category: selectedCategory,
        },
      });
      setRecipes(res?.data?.data);
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error?.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [searchTerm, selectedIngredient, selectedCategory]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Search Recipes</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e?.target?.value)}
          className="flex-1"
        />
        <Select
          value={selectedIngredient}
          onValueChange={(value: any) => setSelectedIngredient(value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select Ingredient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Ingredients</SelectItem>
            {ingredients?.map((ingredient: any) => (
              <SelectItem key={ingredient} value={ingredient}>
                {ingredient}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedCategory}
          onValueChange={(value: any) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories?.map((category: any) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchRecipes}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <LoaderCircleIcon className="animate-spin h-8 w-8" />
        </div>
      ) : recipes?.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes?.map((recipe: any) => (
            <Card key={recipe?.id}>
              <CardHeader>
                <CardTitle>{recipe?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{recipe?.description}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {recipe?.category}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Recipe</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchRecipes;