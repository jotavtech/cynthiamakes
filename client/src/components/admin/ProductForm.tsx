import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DisplayProduct } from "@shared/schema";
import { parsePrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import ImageUpload from "@/components/ui/image-upload";

const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  price: z.string().refine(val => !isNaN(parseFloat(val.replace(",", "."))), {
    message: "Preço deve ser um número válido",
  }),
  category: z.string().min(1, "Categoria é obrigatória"),
  brand: z.string().min(1, "Marca é obrigatória"),
  imageUrl: z.string().optional(),
  videoUrl: z.string().url("URL de vídeo inválida").optional().or(z.literal("")),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: any) => void;
  initialData?: DisplayProduct;
}

const ProductForm = ({ onSubmit, initialData }: ProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          price: initialData.formattedPrice.replace("R$ ", ""),
          category: initialData.category,
          brand: initialData.brand,
          imageUrl: initialData.imageUrl,
          videoUrl: initialData.videoUrl || "",
          isNew: initialData.isNew,
          isFeatured: initialData.isFeatured,
        }
      : {
          name: "",
          description: "",
          price: "",
          category: "",
          brand: "",
          imageUrl: "",
          videoUrl: "",
          isNew: false,
          isFeatured: false,
        },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert price from string to cents
      const priceInCents = parsePrice(data.price);
      
      const productData = {
        ...data,
        price: priceInCents,
        // Se não houver imagem, usar uma imagem padrão
        imageUrl: data.imageUrl || "https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Produto",
        videoUrl: data.videoUrl || undefined, // Don't send empty string
      };
      
      console.log("Dados do produto a serem enviados:", productData);
      
      await onSubmit(productData);
    } catch (error) {
      console.error("Erro ao submeter produto:", error);
      // O tratamento de erro será feito no componente pai
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Base Líquida Ultra HD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 89,90" {...field} />
                </FormControl>
                <FormDescription>
                  Use vírgula como separador decimal (ex: 89,90)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="face">Rosto</SelectItem>
                    <SelectItem value="eyes">Olhos</SelectItem>
                    <SelectItem value="lips">Lábios</SelectItem>
                    <SelectItem value="perfumery">Perfumaria</SelectItem>
                    <SelectItem value="accessories">Acessórios</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                  <FormControl>
                  <Input 
                    placeholder="Ex: MAC, Maybelline, Ruby Rose..." 
                    {...field} 
                  />
                  </FormControl>
                <FormDescription>
                  Digite o nome da marca do produto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o produto..." 
                  {...field} 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem do Produto</FormLabel>
                <FormControl>
                  <ImageUpload
                    onImageUpload={field.onChange}
                    currentImageUrl={field.value}
                  />
                </FormControl>
                <FormDescription>
                  Selecione uma imagem do produto (opcional - será usada uma imagem padrão se não fornecida)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Vídeo (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/video.mp4" {...field} />
                </FormControl>
                <FormDescription>
                  Insira a URL de um vídeo do produto (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Produto Novo</FormLabel>
                  <FormDescription>
                    Marque se este é um produto novo
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Produto em Destaque</FormLabel>
                  <FormDescription>
                    Marque se este produto deve aparecer em destaque
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? "Salvando..." 
            : initialData 
              ? "Atualizar Produto" 
              : "Adicionar Produto"
          }
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;
