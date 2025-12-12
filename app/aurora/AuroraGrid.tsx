import type { AuroraEvent } from "~/api/types";

// Reusable Glass Card
const Card = ({
  title,
  children,
  colorClass = "border-white/10",
}: {
  title: string;
  children: React.ReactNode;
  colorClass?: string;
}) => (
  <div
    className={`relative overflow-hidden group p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border ${colorClass} opacity-90 transition-all duration-300 hover:bg-slate-800/50`}
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-10 group-hover:opacity-100 transition-opacity" />
    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
);

type AuroraGridProps = {
  alert?: AuroraEvent | null;
  watch?: AuroraEvent | null;
  outlook?: AuroraEvent | null;
};

export const AuroraGrid = ({ alert, watch, outlook }: AuroraGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
      {/* 1. Alert Column (Urgent) */}
      <Card
        title="Current Alert"
        colorClass={
          alert
            ? "border-red-500/50 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]"
            : "border-white/5"
        }
      >
        {alert ? (
          <>
            <div className="text-2xl font-semibold text-white">
              {alert.cause || "Geomagnetic Storm"}
            </div>
            <p className="text-sm text-red-200">
              Valid until:{" "}
              {alert.valid_until
                ? new Date(alert.valid_until).toLocaleTimeString()
                : "Unknown"}
            </p>
            {alert.lat_band && (
              <div className="mt-2 inline-block px-2 py-1 bg-red-500/20 rounded text-xs text-red-200">
                {alert.lat_band}
              </div>
            )}
            <p className="text-sm text-slate-300 mt-2">{alert.description}</p>
          </>
        ) : (
          <p className="text-slate-500 italic">No active alerts issued.</p>
        )}
      </Card>

      {/* 2. Watch Column (Imminent) */}
      <Card
        title="Watch Status"
        colorClass={watch ? "border-amber-500/50" : "border-white/5"}
      >
        {watch ? (
          <>
            <div className="text-xl font-medium text-amber-100">
              Predicted K-Index: {watch.k_aus}
            </div>
            <p className="text-sm text-amber-200/80">
              {watch.start_time} - {watch.end_date} (UTC)
            </p>
            <p className="text-sm text-slate-300 mt-2">{watch.description}</p>
          </>
        ) : (
          <p className="text-slate-500 italic">No watch currently in effect.</p>
        )}
      </Card>

      {/* 3. Outlook Column (Future) */}
      <Card title="Outlook" colorClass="border-teal-500/30">
        {outlook ? (
          <>
            <div className="text-lg font-medium text-teal-100">Forecast</div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {outlook.description || "Conditions are monitoring normal."}
            </p>
            {outlook.issue_time && (
              <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-white/5">
                Issued: {new Date(outlook.issue_time).toLocaleString()}
              </p>
            )}
          </>
        ) : (
          <p className="text-slate-500 italic">No outlook data available.</p>
        )}
      </Card>
    </div>
  );
};
