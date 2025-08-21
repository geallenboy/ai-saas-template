import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

export type TPopoverConfirm = {
  title: string;
  onConfirm: () => void;
  confirmBtnText?: string;
  onCancel?: () => void;
  children: React.ReactNode;
};

export const PopOverConfirmProvider = ({
  title,
  onConfirm,
  confirmBtnText = "Confirm",
  onCancel,
  children,
}: TPopoverConfirm) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <Popover open={openConfirm} onOpenChange={setOpenConfirm}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="z-[1000]" side="bottom">
        <p className="text-sm md:text-base font-medium pb-2">{title}</p>
        <div className="flex flex-row gap-1">
          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={(e) => {
              onConfirm();
              e.stopPropagation();
            }}
          >
            {confirmBtnText}
          </Button>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={(e) => {
              onCancel?.();
              setOpenConfirm(false);
              e.stopPropagation();
            }}
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
