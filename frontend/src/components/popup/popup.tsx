//File: popup.tsx
//Component: Wrapper for component to give center_pos + exit_on_outside_click
import PropTypes from "prop-types";

interface popupProps {
  showpopup: boolean;
  onClose?: () => void;
  context?: React.ReactNode;
}

function Popup({ showpopup, onClose, context}: popupProps) {
  if (!showpopup) {
    return null;
  }

  return (
    <>
      {/*Darken Background + off_click()*/}
      <div
        className="fixed inset-0 bg-black/50 z-10"
        onClick={onClose}
      />

      {/*popup Shape*/}
      <div
        className="fixed inset-0 flex items-start justify-center pt-10 z-20 px-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg mt-[10%] rounded-3xl bg-[#002133] shadow-2xl ring-1 ring-orange-200 p-6 overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="mb-4 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
          >
            ✕ Close
          </button>

          {/*popup Insert*/}
          {context}

        </div>
      </div>
    </>
  );
}

Popup.propTypes = {
  showpopup: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  context: PropTypes.node,
};

export default Popup;