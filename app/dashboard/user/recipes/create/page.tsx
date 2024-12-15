"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, LoaderCircleIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import api from "@/lib/api";

const recipeSchema = z.object({
  title: z.string().min(1, { message: "Recipe title is required" }),
  images: z.array(z.string().url({ message: "Please enter a valid URL" })).min(1, { message: "At least one image is required" }),
  ingredients: z.array(z.string().min(1, { message: "Ingredient is required" })).min(1, { message: "At least one ingredient is required" }),
  steps: z.array(z.string().min(1, { message: "Step is required" })).min(1, { message: "At least one step is required" }),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const CreateRecipeForm: React.FC = () => {
  const { data: session } = useSession();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      images: [""],
      ingredients: [""],
      steps: [""],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: "ingredients",
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: "steps",
  });

  const onSubmit = async (data: RecipeFormData) => {
    try {
      const payload = {
        title: data?.title,
        images: data?.images,
        ingredients: data?.ingredients,
        steps: data?.steps,
      };

      const response = await api.post(`/api/users/${session?.user?.id}/recipes`, payload);

      if (response?.data?.success) {
        toast.success("Recipe created successfully!");
        reset();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Create New Recipe</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Recipe Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Recipe Title</Label>
              <Input {...register("title")} placeholder="Enter recipe title" />
              {errors?.title && <p className="text-red-500 text-sm">{errors?.title?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Images</Label>
              {imageFields?.map((field, index) => (
                <div key={field?.id} className="flex items-center space-x-2">
                  <Input {...register(`images.${index}` as const)} placeholder="Enter image URL" />
                  {imageFields?.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={() => appendImage("")} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              {errors?.images && <p className="text-red-500 text-sm">{errors?.images?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              {ingredientFields?.map((field, index) => (
                <div key={field?.id} className="flex items-center space-x-2">
                  <Input {...register(`ingredients.${index}` as const)} placeholder="Enter ingredient" />
                  {ingredientFields?.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={() => appendIngredient("")} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
              {errors?.ingredients && <p className="text-red-500 text-sm">{errors?.ingredients?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps">Steps</Label>
              {stepFields?.map((field, index) => (
                <div key={field?.id} className="flex items-center space-x-2">
                  <Textarea {...register(`steps.${index}` as const)} placeholder="Enter step" />
                  {stepFields?.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={() => appendStep("")} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
              {errors?.steps && <p className="text-red-500 text-sm">{errors?.steps?.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin" />
                  Creating Recipe...
                </>
              ) : (
                "Create Recipe"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateRecipeForm;