import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { PlusCircle, MinusCircle } from "lucide-react";
import { DisplayProduct } from "@shared/schema";

interface StockAdjustmentFormProps {
  product: DisplayProduct;
  stockAction: "add" | "remove" | null;
  onSubmit: (data: { quantity: number; notes: string }) => void;
  onCancel: () => void;
}

const stockAdjustmentSchema = z.object({
  quantity: z.number().min(1, "A quantidade deve ser pelo menos 1"),
  notes: z.string().optional(),
});

export const StockAdjustmentForm = ({ product, stockAction, onSubmit, onCancel }: StockAdjustmentFormProps) => {
  const form = useForm<z.infer<typeof stockAdjustmentSchema>>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof stockAdjustmentSchema>) => {
    onSubmit({
      quantity: data.quantity,
      notes: data.notes || "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-md">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="h-16 w-16 rounded-md object-cover"
          />
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-gray-500">
              Estoque atual: <span className="font-semibold">{product.stock}</span>
            </p>
            {product.sku && (
              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
            )}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value}
                  onChange={e => field.onChange(parseInt(e.target.value || "0", 10))}
                  min={1}
                  max={stockAction === "remove" ? product.stock : undefined}
                />
              </FormControl>
              <FormDescription>
                {stockAction === "add" 
                  ? "Quantidade a ser adicionada ao estoque" 
                  : "Quantidade a ser removida do estoque"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder={stockAction === "add" 
                    ? "Ex: Recebimento de fornecedor" 
                    : "Ex: Produtos danificados"
                  }
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Informações adicionais sobre este ajuste de estoque
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            className={stockAction === "add" 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-red-600 hover:bg-red-700"
            }
          >
            {stockAction === "add" 
              ? <PlusCircle className="h-4 w-4 mr-2" /> 
              : <MinusCircle className="h-4 w-4 mr-2" />
            }
            {stockAction === "add" ? "Adicionar ao Estoque" : "Remover do Estoque"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}; 