import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClaimProduct } from "@/types/claim";

interface ProductInfoProps {
  product: ClaimProduct;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produktinformasjon</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{product.name}</p>
          {product.productNumber && (
            <p className="text-sm text-muted-foreground">Produktnr: {product.productNumber}</p>
          )}
          {product.serialNumber && (
            <p className="text-sm text-muted-foreground">Serienummer: {product.serialNumber}</p>
          )}
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium">Kjøpsdato:</p>
            <p className="text-muted-foreground">{product.purchaseDate}</p>
          </div>
          <div>
            <p className="font-medium">Garanti:</p>
            <p className="text-muted-foreground">{product.warranty}</p>
          </div>
          <div>
            <p className="font-medium">Leverandør:</p>
            <p className="text-muted-foreground">{product.supplier}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};