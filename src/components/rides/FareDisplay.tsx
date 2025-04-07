
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
  distance?: number;
  baseFare?: number;
  distanceSurcharge?: number;
  timeSurcharge?: number;
  surgeFactor?: number;
}

const FareDisplay = ({ 
  calculatedFare, 
  distance, 
  baseFare = null, 
  distanceSurcharge = null, 
  timeSurcharge = null,
  surgeFactor = 1.0
}: FareDisplayProps) => {
  // Calculate fare components for display with improved dynamic calculations
  const baseF = baseFare !== null ? baseFare : (calculatedFare ? Math.round(calculatedFare * 0.5) : null);
  const distanceS = distanceSurcharge !== null ? distanceSurcharge : (calculatedFare ? Math.round(calculatedFare * 0.3) : null);
  const timeS = timeSurcharge !== null ? timeSurcharge : (calculatedFare ? Math.round(calculatedFare * 0.2) : null);
  
  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-primary mr-2 font-bold">₹</span>
          <span className="font-medium">Estimated Fare:</span>
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
            <span>₹{baseF}</span>
          </div>
          <div className="flex justify-between">
            <span>Distance surcharge:</span>
            <span>₹{distanceS}</span>
          </div>
          <div className="flex justify-between">
            <span>Time of day adjustment:</span>
            <span>₹{timeS}</span>
          </div>
          {distance && (
            <div className="flex justify-between text-primary-foreground/70">
              <span>Distance (approx):</span>
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
          {surgeFactor > 1.0 && (
            <div className="flex justify-between text-primary">
              <span>Peak hour surcharge:</span>
              <span>x{surgeFactor.toFixed(1)}</span>
            </div>
          )}
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
                Fare is dynamically calculated based on the Haversine distance between locations, 
                current demand, time of day, and estimated travel time.
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
