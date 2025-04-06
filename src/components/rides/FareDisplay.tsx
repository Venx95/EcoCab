
import { DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface FareDisplayProps {
  calculatedFare: number | null;
}

const FareDisplay = ({ calculatedFare }: FareDisplayProps) => {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">Suggested Fare:</span>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold"
        >
          ${calculatedFare || '—'}
        </motion.div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Based on distance, time of day, and current demand
      </div>
    </div>
  );
};

export default FareDisplay;
