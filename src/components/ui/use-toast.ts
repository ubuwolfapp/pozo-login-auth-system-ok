
// Re-export from hooks/use-toast to maintain compatibility with existing imports
// We need to import React properly to prevent null reference errors
import * as React from 'react';
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };
