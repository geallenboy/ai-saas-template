import { Editor, Extension } from "@tiptap/core";

export const ShiftEnterToLineBreak = Extension.create({
  addKeyboardShortcuts() {
    return {
      "Shift-Enter": (_) => {
        return _.editor.commands.enter();
      },
    };
  },
});

export const EnterKey = (onEnter: (editor: Editor) => void) =>
  Extension.create({
    addKeyboardShortcuts() {
      return {
        Enter: (_) => {
          if (_.editor.getText()?.length > 0) {
            onEnter(_.editor);
          }
          return true;
        },
      };
    },
  });

export const DisableEnter = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: () => true,
    };
  },
});
