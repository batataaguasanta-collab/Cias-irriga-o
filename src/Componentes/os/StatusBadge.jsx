import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const statusConfig = {
  "Pendente": {
    color: "bg-amber-500 hover:bg-amber-600 text-white",
    icon: Clock,
  },
  "Em Andamento": {
    color: "bg-blue-500 hover:bg-blue-600 text-white",
    icon: PlayCircle,
  },
  "Concluída": {
    color: "bg-emerald-500 hover:bg-emerald-600 text-white",
    icon: CheckCircle2,
  },
  "Interrompida": {
    color: "bg-red-500 hover:bg-red-600 text-white",
    icon: AlertTriangle,
  }
};

export default function StatusBadge({ status, size = "default" }) {
  const config = statusConfig[status] || statusConfig["Pendente"];
  const Icon = config.icon;
  
  const sizeClasses = size === "large" 
    ? "text-lg px-4 py-2" 
    : "text-sm px-3 py-1";

  return (
    <Badge className={`${config.color} ${sizeClasses} flex items-center gap-2 font-semibold`}>
      <Icon className={size === "large" ? "w-5 h-5" : "w-4 h-4"} />
      {status}
    </Badge>
  );
}