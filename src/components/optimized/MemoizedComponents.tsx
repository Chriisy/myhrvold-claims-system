import React, { memo } from 'react';

interface FileDisplayItemProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}

const FileDisplayItem = memo(({ file, index, onRemove }: FileDisplayItemProps) => (
  <div className="flex items-center justify-between p-2 border rounded">
    <span className="text-sm">{file.name}</span>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="text-red-500 hover:text-red-700 text-sm"
    >
      Fjern
    </button>
  </div>
));

FileDisplayItem.displayName = 'FileDisplayItem';

interface CustomLineItemProps {
  item: any;
  index: number;
}

const CustomLineItem = memo(({ item, index }: CustomLineItemProps) => (
  <div>• {item.partNumber} - {item.description} ({item.quantity} stk)</div>
));

CustomLineItem.displayName = 'CustomLineItem';

export { FileDisplayItem, CustomLineItem };