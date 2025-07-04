export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Ny": return "bg-accent/10 text-accent border-accent/20";
    case "Under behandling": return "bg-secondary/10 text-secondary border-secondary/20";
    case "Sendt til leverandør": return "bg-primary/10 text-primary border-primary/20";
    case "Løst": return "bg-green-100 text-green-800 border-green-200";
    default: return "bg-muted text-muted-foreground";
  }
};

export const getUrgencyColor = (urgency: string): string => {
  switch (urgency) {
    case "Kritisk": return "bg-red-100 text-red-800 border-red-200";
    case "Høy": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Middels": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Lav": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-muted text-muted-foreground";
  }
};