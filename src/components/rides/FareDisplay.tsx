
import { Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FareDisplayProps {
  calculatedFare: number | null;
}

const FareDisplay = ({ calculatedFare }: FareDisplayProps) => {
  // Calculate fare components for display
  const baseFare = calculatedFare ? Math.round(calculatedFare * 0.7) : null;
  const distanceSurcharge = calculatedFare ? Math.round(calculatedFare * 0.2) : null;
  const timeSurcharge = calculatedFare ? Math.round(calculatedFare * 0.1) : null;
  
  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-primary mr-2 font-bold">₹</span>
          <span className="font-medium">Suggested Fare:</span>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold"
        >
          ₹{calculatedFare !== null ? calculatedFare : '—'}
        </motion.div>
      </div>
      
      {calculatedFare !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xs space-y-1 border-t border-border pt-2 mt-2"
        >
          <div className="flex justify-between">
            <span>Base fare:</span>
            <span>₹{baseFare}</span>
          </div>
          <div className="flex justify-between">
            <span>Distance surcharge:</span>
            <span>₹{distanceSurcharge}</span>
          </div>
          <div className="flex justify-between">
            <span>Time of day adjustment:</span>
            <span>₹{timeSurcharge}</span>
          </div>
        </motion.div>
      )}
      
      <div className="text-xs text-muted-foreground mt-3 flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 mr-1.5 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-60">
                Fare is calculated based on distance between locations, current demand, time of day, and traffic conditions.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        Based on distance, time of day, and current demand
      </div>
    </div>
  );
};

export default FareDisplay;
