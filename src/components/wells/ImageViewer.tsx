
import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ImageViewerProps {
  imageUrl: string;
  open: boolean;
  onClose: () => void;
}

const ImageViewer = ({ imageUrl, open, onClose }: ImageViewerProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-0">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 bg-black/50 rounded-full p-2 hover:bg-black/70"
        >
          <X className="h-6 w-6 text-white" />
        </button>
        <img
          src={imageUrl}
          alt="Well photo"
          className="w-full h-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
