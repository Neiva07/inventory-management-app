import React, { useEffect, useState } from 'react';
import { cn } from 'lib/utils';
import { isMac } from 'lib/platform';
import { useOnboarding } from '../../context/onboarding';
import { useNavigationMode } from '../../context/navigationMode';
import type { NavigationMode } from '../../lib/navigationKeys';

// ---------------------------------------------------------------------------
// Keyboard layout data
// ---------------------------------------------------------------------------

interface KeyDef {
  id: string;
  label: string;
  sublabel?: string;
  /** Width multiplier — 1 = standard square key */
  width?: number;
}

const numberRow: KeyDef[] = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  { id: '5', label: '5' },
  { id: '6', label: '6' },
  { id: '7', label: '7' },
  { id: '8', label: '8' },
  { id: '9', label: '9' },
  { id: '0', label: '0' },
];

const qwertyRow: KeyDef[] = [
  { id: 'tab', label: 'Tab', width: 1.4 },
  { id: 'Q', label: 'Q' },
  { id: 'W', label: 'W' },
  { id: 'E', label: 'E' },
  { id: 'R', label: 'R' },
  { id: 'T', label: 'T' },
  { id: 'Y', label: 'Y' },
  { id: 'U', label: 'U' },
  { id: 'I', label: 'I' },
  { id: 'O', label: 'O' },
  { id: 'P', label: 'P' },
];

const homeRow: KeyDef[] = [
  { id: 'A', label: 'A' },
  { id: 'S', label: 'S' },
  { id: 'D', label: 'D' },
  { id: 'F', label: 'F' },
  { id: 'G', label: 'G' },
  { id: 'H', label: 'H' },
  { id: 'J', label: 'J' },
  { id: 'K', label: 'K' },
  { id: 'L', label: 'L' },
  { id: 'enter', label: isMac ? 'return' : 'Enter', width: 1.6 },
];

const bottomRow: KeyDef[] = [
  { id: 'shift', label: isMac ? '⇧' : 'Shift', sublabel: isMac ? 'shift' : undefined, width: 2 },
  { id: 'Z', label: 'Z' },
  { id: 'X', label: 'X' },
  { id: 'C', label: 'C' },
  { id: 'V', label: 'V' },
  { id: 'B', label: 'B' },
  { id: 'N', label: 'N' },
  { id: 'M', label: 'M' },
  { id: ',', label: ',' },
  { id: '.', label: '.' },
  { id: 'shift2', label: isMac ? '⇧' : 'Shift', width: 1.4 },
];

const macModRow: KeyDef[] = [
  { id: 'fn', label: 'fn', width: 1 },
  { id: 'ctrl', label: '⌃', width: 1 },
  { id: 'opt', label: '⌥', width: 1 },
  { id: 'cmd', label: '⌘', sublabel: 'command', width: 2.5 },
  { id: 'space', label: '', width: 4 },
  { id: 'cmd2', label: '⌘', width: 1.5 },
];

const winModRow: KeyDef[] = [
  { id: 'ctrl', label: 'Ctrl', width: 2 },
  { id: 'win', label: '⊞', width: 1 },
  { id: 'alt', label: 'Alt', width: 1 },
  { id: 'space', label: '', width: 4 },
  { id: 'alt2', label: 'Alt', width: 1 },
  { id: 'ctrl2', label: 'Ctrl', width: 1 },
];

interface KeyboardRow {
  keys: KeyDef[];
  /** Left offset in key-width units (simulates staggered rows) */
  offsetUnits: number;
}

const KEYBOARD_ROWS: KeyboardRow[] = [
  { keys: numberRow, offsetUnits: 0 },
  { keys: qwertyRow, offsetUnits: 0 },
  { keys: homeRow, offsetUnits: 0.65 },
  { keys: bottomRow, offsetUnits: 0 },
  { keys: isMac ? macModRow : winModRow, offsetUnits: 0 },
];

// ---------------------------------------------------------------------------
// Demo sequences for each mode
// ---------------------------------------------------------------------------

interface DemoStep {
  keys: string[];
  label: string;
}

const TAB_DEMOS: DemoStep[] = [
  { keys: ['tab'], label: 'Próximo campo' },
  { keys: ['shift', 'shift2', 'tab'], label: 'Campo anterior' },
];

const ENTER_DEMOS: DemoStep[] = [
  { keys: ['enter'], label: 'Próximo campo' },
  { keys: ['shift', 'shift2', 'enter'], label: 'Campo anterior' },
];

// ---------------------------------------------------------------------------
// Key cap component
// ---------------------------------------------------------------------------

const KEY_PX = 36;
const GAP_PX = 3;

interface KeyCapProps {
  def: KeyDef;
  active: boolean;
}

const KeyCap: React.FC<KeyCapProps> = ({ def, active }) => {
  const w = (def.width ?? 1) * KEY_PX + ((def.width ?? 1) - 1) * GAP_PX;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border select-none',
        'transition-all duration-300 ease-out',
        isMac ? 'rounded-lg' : 'rounded-md',
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105 -translate-y-px'
          : 'bg-white dark:bg-zinc-800 text-muted-foreground border-zinc-200 dark:border-zinc-600 shadow-[0_2px_0_0_rgba(0,0,0,0.06)]',
      )}
      style={{ width: w, height: KEY_PX }}
    >
      <span
        className={cn(
          'leading-tight font-semibold',
          def.sublabel ? 'text-[12px]' : 'text-[11px]',
        )}
      >
        {def.label}
      </span>
      {def.sublabel && (
        <span className="text-[7px] leading-tight opacity-70 mt-0.5">
          {def.sublabel}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const STEP_NUMBER = 6;

export const KeyboardShortcutsSetup: React.FC = () => {
  const { navigationMode, setNavigationMode } = useNavigationMode();
  const { setStepValidation } = useOnboarding();

  const [selectedMode, setSelectedMode] = useState<NavigationMode>(navigationMode);
  const [demoIndex, setDemoIndex] = useState(0);
  const [showHighlight, setShowHighlight] = useState(false);

  // Always valid — this step is optional
  useEffect(() => {
    setStepValidation(STEP_NUMBER, true);
  }, []);

  const demos = selectedMode === 'tab' ? TAB_DEMOS : ENTER_DEMOS;

  // Looping animation: highlight → pause → next demo
  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runCycle = (index: number) => {
      if (!mounted) return;

      setDemoIndex(index);
      setShowHighlight(true);

      timeoutId = setTimeout(() => {
        if (!mounted) return;
        setShowHighlight(false);

        timeoutId = setTimeout(() => {
          if (!mounted) return;
          runCycle((index + 1) % demos.length);
        }, 700);
      }, 2000);
    };

    // Reset animation when mode changes
    setDemoIndex(0);
    setShowHighlight(false);
    timeoutId = setTimeout(() => runCycle(0), 500);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [selectedMode, demos.length]);

  const handleModeChange = (mode: NavigationMode) => {
    setSelectedMode(mode);
    setNavigationMode(mode);
  };

  // Determine which keys are lit up right now
  const currentDemo = demos[demoIndex];
  const activeKeys = new Set<string>();
  if (showHighlight && currentDemo) {
    for (const key of currentDemo.keys) {
      activeKeys.add(key);
    }
  }

  const navLabel = selectedMode === 'tab' ? 'Tab' : 'Enter';
  const navBackLabel = selectedMode === 'tab' ? 'Shift+Tab' : 'Shift+Enter';

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Navegação entre Campos
        </h2>
        <h3 className="text-lg text-muted-foreground mb-2">
          Como você prefere navegar nos formulários?
        </h3>
        <p className="text-base text-muted-foreground max-w-[600px] mx-auto">
          Escolha a tecla para avançar e voltar entre campos. Você pode alterar
          isso depois em Configurações.
        </p>
      </div>

      {/* Mode selector cards */}
      <div className="flex justify-center gap-4 mb-8">
        {([
          {
            value: 'tab' as NavigationMode,
            title: 'Tab',
            forward: 'Tab',
            backward: 'Shift+Tab',
          },
          {
            value: 'enter' as NavigationMode,
            title: 'Enter',
            forward: 'Enter',
            backward: 'Shift+Enter',
          },
        ]).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleModeChange(opt.value)}
            className={cn(
              'w-[200px] rounded-xl border-2 p-5 text-left transition-all',
              selectedMode === opt.value
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20',
            )}
          >
            <p className="text-base font-bold mb-2">{opt.title}</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs font-semibold">
                  {opt.forward}
                </kbd>{' '}
                próximo
              </p>
              <p>
                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs font-semibold">
                  {opt.backward}
                </kbd>{' '}
                anterior
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Animated keyboard */}
      <div className="flex justify-center mb-4">
        <div
          className={cn(
            'inline-flex flex-col items-center p-5 rounded-2xl border shadow-inner',
            'bg-gradient-to-b from-muted/40 to-muted/80',
          )}
          style={{ gap: GAP_PX }}
        >
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="flex"
              style={{
                gap: GAP_PX,
                paddingLeft: row.offsetUnits * (KEY_PX + GAP_PX),
              }}
            >
              {row.keys.map((key) => (
                <KeyCap
                  key={key.id}
                  def={key}
                  active={activeKeys.has(key.id)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating shortcut label */}
      <div className="flex justify-center h-9">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2',
            'transition-all duration-300',
            showHighlight
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2',
          )}
        >
          <span className="font-mono text-sm font-bold text-primary">
            {currentDemo?.keys.length === 1 ? navLabel : navBackLabel}
          </span>
          <span className="text-sm text-primary/80">&rarr;</span>
          <span className="text-sm font-medium text-primary">
            {currentDemo?.label}
          </span>
        </div>
      </div>
    </div>
  );
};
