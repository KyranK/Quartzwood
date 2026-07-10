import PropTypes from "prop-types";
import { type ReactNode } from "react";

interface PanelProps {
  showPanel: boolean;
  onClose?: () => void;
  context?: React.ReactNode;
}

function Panel({ showPanel, onClose, context}: PanelProps) {
  if (!showPanel) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-10"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-20 p-6 overflow-y-auto">
        <button
          onClick={onClose}
          className="mb-4 text-gray-500 hover:text-black"
        >
          ✕ Close
        </button>
        
        {context}

      </div>
    </>
  );
}

Panel.propTypes = {
  showPanel: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  context: PropTypes.node,
};

export default Panel;