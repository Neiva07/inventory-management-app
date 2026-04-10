import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Ruler,
  Tag,
  Wallet,
  X,
} from 'lucide-react';
import { Card, CardContent } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Switch } from 'components/ui/switch';
import { useOnboarding } from '../../context/onboarding';
import { paymentMethods } from '../../model/paymentMethods';
import {
  DEFAULT_ACCEPTED_PAYMENT_METHOD_IDS,
  DEFAULT_CATEGORIES,
  DEFAULT_UNITS,
} from './cadastrosBasicosDefaults';

type EditableItem = {
  id: string;
  name: string;
  description?: string;
};

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const toEditable = (
  items: { name: string; description?: string }[]
): EditableItem[] =>
  items.map((item) => ({
    id: generateId(),
    name: item.name,
    description: item.description,
  }));

const stripIds = (
  items: EditableItem[]
): { name: string; description?: string }[] =>
  items.map((item) => ({
    name: item.name,
    description: item.description,
  }));

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  icon,
  title,
  subtitle,
  open,
  onToggle,
  children,
}) => (
  <Card>
    <CardContent className="p-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-5 text-left hover:bg-muted/40 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {open ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="border-t px-5 py-5">{children}</div>}
    </CardContent>
  </Card>
);

interface ChipListProps {
  items: EditableItem[];
  onChange: (items: EditableItem[]) => void;
  addLabel: string;
  placeholder: string;
}

const ChipList: React.FC<ChipListProps> = ({
  items,
  onChange,
  addLabel,
  placeholder,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEdit = (item: EditableItem) => {
    setEditingId(item.id);
    setDraftValue(item.name);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = draftValue.trim();
    if (trimmed.length === 0) {
      onChange(items.filter((item) => item.id !== editingId));
    } else {
      onChange(
        items.map((item) =>
          item.id === editingId ? { ...item, name: trimmed } : item
        )
      );
    }
    setEditingId(null);
    setDraftValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftValue('');
  };

  const remove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addNew = () => {
    const newItem: EditableItem = { id: generateId(), name: '' };
    onChange([...items, newItem]);
    setEditingId(newItem.id);
    setDraftValue('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isEditing = item.id === editingId;
          return (
            <div
              key={item.id}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background pl-3 pr-1.5 py-1 text-sm shadow-sm transition-colors hover:border-primary/40"
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitEdit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                  }}
                  placeholder={placeholder}
                  className="bg-transparent outline-none min-w-[80px] max-w-[200px] py-0.5"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="py-0.5 outline-none focus-visible:underline"
                >
                  {item.name}
                  {item.description ? (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({item.description})
                    </span>
                  ) : null}
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Remover"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={addNew}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
    </div>
  );
};

export const CadastrosBasicosSetup: React.FC = () => {
  const { onboardingData, updateData, setStepValidation, nextStep } = useOnboarding();

  const initialState = useMemo(() => {
    const stored = onboardingData.cadastrosBasicos;
    if (stored && !stored.skipped) {
      return {
        units: toEditable(stored.units),
        categories: toEditable(stored.categories),
        acceptedPaymentMethodIds: stored.acceptedPaymentMethodIds,
      };
    }
    return {
      units: toEditable(DEFAULT_UNITS),
      categories: toEditable(DEFAULT_CATEGORIES),
      acceptedPaymentMethodIds: DEFAULT_ACCEPTED_PAYMENT_METHOD_IDS,
    };
  }, []);

  const [unitsState, setUnitsState] = useState<EditableItem[]>(initialState.units);
  const [categoriesState, setCategoriesState] = useState<EditableItem[]>(initialState.categories);
  const [acceptedPaymentMethodIds, setAcceptedPaymentMethodIds] = useState<string[]>(
    initialState.acceptedPaymentMethodIds
  );
  const [openSection, setOpenSection] = useState<string | null>('units');

  useEffect(() => {
    setStepValidation(5, true);
  }, []);

  // Persist on first mount so the initial defaults are stored even if the user
  // walks away without touching anything.
  useEffect(() => {
    if (!onboardingData.cadastrosBasicos) {
      updateData({
        cadastrosBasicos: {
          units: stripIds(initialState.units),
          categories: stripIds(initialState.categories),
          acceptedPaymentMethodIds: initialState.acceptedPaymentMethodIds,
          skipped: false,
        },
      });
    }
  }, []);

  const persist = (
    nextUnits: EditableItem[],
    nextCategories: EditableItem[],
    nextPaymentMethods: string[]
  ) => {
    updateData({
      cadastrosBasicos: {
        units: stripIds(nextUnits),
        categories: stripIds(nextCategories),
        acceptedPaymentMethodIds: nextPaymentMethods,
        skipped: false,
      },
    });
  };

  const handleUnitsChange = (next: EditableItem[]) => {
    setUnitsState(next);
    persist(next, categoriesState, acceptedPaymentMethodIds);
  };

  const handleCategoriesChange = (next: EditableItem[]) => {
    setCategoriesState(next);
    persist(unitsState, next, acceptedPaymentMethodIds);
  };

  const togglePaymentMethod = (id: string, enabled: boolean) => {
    const next = enabled
      ? Array.from(new Set([...acceptedPaymentMethodIds, id]))
      : acceptedPaymentMethodIds.filter((existing) => existing !== id);
    setAcceptedPaymentMethodIds(next);
    persist(unitsState, categoriesState, next);
  };

  const handleSkip = () => {
    setUnitsState([]);
    setCategoriesState([]);
    setAcceptedPaymentMethodIds([]);
    updateData({
      cadastrosBasicos: {
        units: [],
        categories: [],
        acceptedPaymentMethodIds: [],
        skipped: true,
      },
    });
    nextStep();
  };

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Cadastros Básicos
        </h2>
        <h3 className="text-lg text-muted-foreground mb-2">
          Personalize sua configuração inicial
        </h3>
        <p className="text-base text-muted-foreground max-w-[600px] mx-auto">
          Pré-carregamos alguns cadastros que todo estoque precisa. Edite, remova
          ou adicione conforme a realidade do seu negócio. Você pode pular esta
          etapa e configurar tudo depois.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <Section
          icon={<Ruler className="h-6 w-6 text-primary" />}
          title="Unidades de medida"
          subtitle="Como você mede e vende seus produtos"
          open={openSection === 'units'}
          onToggle={() => toggleSection('units')}
        >
          <ChipList
            items={unitsState}
            onChange={handleUnitsChange}
            addLabel="Adicionar unidade"
            placeholder="Ex: Litro"
          />
        </Section>

        <Section
          icon={<Tag className="h-6 w-6 text-emerald-600" />}
          title="Categorias de produtos"
          subtitle="Como você organiza seu catálogo"
          open={openSection === 'categories'}
          onToggle={() => toggleSection('categories')}
        >
          <ChipList
            items={categoriesState}
            onChange={handleCategoriesChange}
            addLabel="Adicionar categoria"
            placeholder="Ex: Bebidas"
          />
        </Section>

        <Section
          icon={<Wallet className="h-6 w-6 text-amber-600" />}
          title="Formas de pagamento"
          subtitle="Quais formas de pagamento sua empresa aceita"
          open={openSection === 'payments'}
          onToggle={() => toggleSection('payments')}
        >
          <div className="flex flex-col gap-2">
            {paymentMethods.map((method) => {
              const enabled = acceptedPaymentMethodIds.includes(method.id);
              return (
                <label
                  key={method.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3 cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <span className="text-sm font-medium">{method.label}</span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => togglePaymentMethod(method.id, checked)}
                  />
                </label>
              );
            })}
          </div>
        </Section>
      </div>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Pular esta etapa
        </Button>
      </div>
    </div>
  );
};
