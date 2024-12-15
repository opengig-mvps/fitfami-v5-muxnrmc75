"use client";

import { useState, useEffect } from "react";
import { Heart, LoaderCircleIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const RecipeFeedPage = () => {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!session) return;

    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${session?.user?.id}/recipes`);
        setRecipes(response?.data?.data);
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

    fetchRecipes();
  }, [session]);

  const handleLike = async (recipeId: string) => {
    try {
      const response = await axios.post(`/api/users/${session?.user?.id}/recipes/${recipeId}/like`);
      if (response?.data?.success) {
        toast.success("Recipe liked!");
        setRecipes((prevRecipes) =>
          prevRecipes?.map((recipe: any) =>
            recipe?.id === recipeId ? { ...recipe, likes: recipe?.likes + 1 } : recipe
          )
        );
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error?.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircleIcon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="container px-4 md:px-6 py-6">
          <ScrollArea className="w-full whitespace-nowra">
            <div className="flex w-max space-x-4 mt-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <Button key={i} variant="ghost" className="flex flex-col items-center space-y-2">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={`https://picsum.photos/seed/${i}/200`} alt={`User ${i + 1}`} />
                    <AvatarFallback>U{i + 1}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">User {i + 1}</span>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
        <section className="container px-4 md:px-6 py-6 space-y-6">
          {recipes?.map((recipe: any) => (
            <Card key={recipe?.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={recipe?.user?.avatarUrl} alt={recipe?.user?.name} />
                  <AvatarFallback>{recipe?.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{recipe?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">Posted {recipe?.createdAt}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <img
                  src={recipe?.imageUrl}
                  alt={recipe?.title}
                  className="w-full h-auto aspect-square object-cover"
                />
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-4 w-full">
                  <Button variant="ghost" size="icon" onClick={() => handleLike(recipe?.id)}>
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Like</span>
                  </Button>
                </div>
                <div className="text-sm">
                  <p>
                    <span className="font-medium">{recipe?.user?.name}</span> {recipe?.title}
                  </p>
                  <p className="text-muted-foreground mt-1">{recipe?.description}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
};

export default RecipeFeedPage;