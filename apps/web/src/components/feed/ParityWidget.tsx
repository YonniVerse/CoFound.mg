interface ParityWidgetProps {
  percentage?: number;
}

export function ParityWidget({ percentage = 38 }: ParityWidgetProps) {
  return (
    <div className="bg-background border border-female/20 rounded-xl p-5 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-female/5 rounded-full blur-2xl -mr-10 -mt-10" />
      <div className="relative z-10">
        <h4 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-female">Impact Parité</span> 📈
        </h4>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-black text-foreground tracking-tight">{percentage}%</span>
          <span className="text-xs text-muted-foreground font-medium mb-1">profils féminins (cette sem.)</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-female rounded-full" style={{ width: `${percentage}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Notre objectif : 50%. Aidez-nous en invitant des étudiantes !
        </p>
      </div>
    </div>
  );
}
