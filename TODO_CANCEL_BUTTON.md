# TODO: Add Cancel Button to EditTaskForm

## Task:
Modify all forms to have a working Cancel button that exits/closes the form when clicked.

## Status:
- [x] BoardForm.tsx - Already has Cancel button with `closeModal`
- [x] ColumnForm.tsx - Already has Cancel button with `closeModal`  
- [x] CreateTaskForm.tsx - Already has Cancel button with `closeModal`
- [x] EditTaskForm.tsx - ✅ Added Cancel button with `closeModal`

## Implementation:
Edit EditTaskForm.tsx to add Cancel button similar to other forms.

## Changes Made:
Added Cancel button to EditTaskForm.tsx with:
- type="button"
- name="Cancel"
- click={closeModal}
- padding="0.75rem 2rem"
- borderRad="0.5rem"
- fw="600"
- background="#6b7280"
