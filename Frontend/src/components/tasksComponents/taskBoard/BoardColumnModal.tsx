import { useState } from "react";
import ConfirmationModal from "../../generalPurposeComponents/ConfirmationModal";

interface BoardColumnModalProps {
    editingColumn: boolean;
    columnStatus: string;
    creatingColumn: boolean;
    updatingColumn: boolean;
    deletingColumn: boolean;
    onStatusChange: (status: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    onDelete: () => void;
}

export default function BoardColumnModal({
    editingColumn,
    columnStatus,
    creatingColumn,
    updatingColumn,
    deletingColumn,
    onStatusChange,
    onClose,
    onSubmit,
    onDelete,
}: BoardColumnModalProps) {
    const isSaving =
        creatingColumn || updatingColumn;

    const isDisabled =
        creatingColumn ||
        updatingColumn ||
        deletingColumn;

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        console.log("Delete confirmed");
        onDelete();
        setShowDeleteConfirmation(false);
    };

    const handleCancelDelete = () => {
        console.log("Delete canceled");
        setShowDeleteConfirmation(false);
    };
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onMouseDown={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <h2 className="mb-5 text-xl font-semibold">
                    {editingColumn
                        ? "Edit Board Column"
                        : "Add Board Column"}
                </h2>

                <div className="mb-4">
                    <label
                        htmlFor="column-name"
                        className="mb-2 block text-sm font-medium"
                    >
                        Status
                    </label>

                    <input
                        id="column-name"
                        type="text"
                        value={columnStatus}
                        onChange={(event) =>
                            onStatusChange(
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center justify-between">
                    {editingColumn ? (
                        <button
                            type="button"
                            disabled={
                                deletingColumn ||
                                updatingColumn
                            }
                            onClick={handleDeleteClick}
                            className="rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {deletingColumn
                                ? "Deleting..."
                                : "Delete"}
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={isDisabled}
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 hover:bg-gray-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={
                                isDisabled ||
                                !columnStatus.trim()
                            }
                            onClick={onSubmit}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed"
                        >
                            {isSaving
                                ? "Saving..."
                                : editingColumn
                                    ? "Update"
                                    : "Create"}
                        </button>
                    </div>
                </div>
            </div>
            {showDeleteConfirmation && (
                <div onMouseDown={(e) => e.stopPropagation()}>
                    <ConfirmationModal
                        message={`Are you sure you want to delete "${columnStatus}"?`}
                        danger={true}
                        confirmText="Delete"
                        cancelText="Cancel"
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                    />
                </div>
            )}
        </div>
    );
}