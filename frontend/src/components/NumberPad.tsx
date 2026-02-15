type NumberPadProps = {
  notesMode: boolean;
  liveValidation: boolean;
  canUndo: boolean;
  disabledDigits: boolean[];
  onDigit: (digit: number) => void;
  onClear: () => void;
  onToggleNotesMode: () => void;
  onToggleLiveValidation: () => void;
  onUndo: () => void;
  onCheck: () => void;
  onNewGame: () => void;
};

// NumberPad is an input unit, similar to a toolbar on a Pascal form.
// It does not own game state, it only calls callbacks from App.
export function NumberPad({
  notesMode,
  liveValidation,
  canUndo,
  disabledDigits,
  onDigit,
  onClear,
  onToggleNotesMode,
  onToggleLiveValidation,
  onUndo,
  onCheck,
  onNewGame,
}: NumberPadProps) {
  return (
    <section className="pad" aria-label="Sudoku controls">
      <div className="pad-grid">
        {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
          // Disabled flag comes from derived state in App.
          <button
            key={digit}
            type="button"
            className="pad-key"
            disabled={disabledDigits[digit]}
            onClick={() => onDigit(digit)}
          >
            {digit}
          </button>
        ))}
      </div>

      <div className="pad-actions">
        <button type="button" className="action-key" onClick={onClear}>
          Clear
        </button>
        <button
          type="button"
          className={`action-key ${notesMode ? "active" : ""}`}
          onClick={onToggleNotesMode}
        >
          Notes
        </button>
        <button
          type="button"
          className={`action-key ${liveValidation ? "active" : ""}`}
          onClick={onToggleLiveValidation}
        >
          Live check
        </button>
        <button
          type="button"
          className="action-key"
          disabled={!canUndo}
          onClick={onUndo}
        >
          Undo
        </button>
        <button type="button" className="action-key" onClick={onCheck}>
          Check
        </button>
        <button type="button" className="action-key" onClick={onNewGame}>
          New game
        </button>
      </div>
    </section>
  );
}
