
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { MessageSquare } from 'lucide-react';

const Messages = () => {
  return (
    <div className="container mx-auto py-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">No messages yet</h3>
              <p className="max-w-xs mt-2">
                When you book rides or receive booking requests, your conversations will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;
