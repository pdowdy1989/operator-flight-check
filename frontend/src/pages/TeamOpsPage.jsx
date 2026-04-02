import PageWrapper from "../components/layout/PageWrapper";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const TEAM_SUMMARY = [
  { label: "Today's jobs", value: "4", note: "2 active, 2 queued" },
  { label: "Aircraft ready", value: "6", note: "Across three crews" },
  { label: "Pilots assigned", value: "5", note: "1 backup on standby" },
];

const TEAM_MISSIONS = [
  {
    id: "job-101",
    title: "Solar Farm Thermal Pass",
    location: "Bakersfield, CA",
    window: "8:00 AM - 10:30 AM",
    status: "Green",
    drones: ["Matrice 350", "DJI Air 3"],
    crew: ["Lead Pilot: Maya", "VO: Carlos", "Thermal Analyst: June"],
  },
  {
    id: "job-102",
    title: "Construction Progress Capture",
    location: "Irvine, CA",
    window: "11:00 AM - 1:00 PM",
    status: "Yellow",
    drones: ["Mini 4 Pro"],
    crew: ["Pilot: Andre", "VO: Nina"],
  },
  {
    id: "job-103",
    title: "Coastal Infrastructure Sweep",
    location: "Dana Point, CA",
    window: "2:30 PM - 4:00 PM",
    status: "Green",
    drones: ["DJI Air 3", "Matrice 350", "Mini 4 Pro"],
    crew: ["Ops Lead: Tessa", "Pilot: Omar", "Pilot: Reed", "VO: Elena"],
  },
];

function statusClasses(status) {
  if (status === "Green") return "border-green-500/30 bg-green-500/10 text-green-300";
  if (status === "Yellow") return "border-ped-orange/30 bg-ped-orange/10 text-orange-300";
  return "border-red-500/30 bg-red-500/10 text-red-300";
}

export default function TeamOpsPage() {
  const { user } = useAuth();

  return (
    <PageWrapper
      title="Team Operations"
      subtitle={`Coordinate crews, aircraft, and job windows for ${user?.teamName ?? "your operations team"}.`}
      action={<Button size="sm">Create mission block</Button>}
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {TEAM_SUMMARY.map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
            <p className="mt-1 text-sm text-slate-400">{item.note}</p>
          </Card>
        ))}
      </div>

      <Card title="Team planning model" className="mb-6">
        <div className="space-y-3 px-4 py-4 text-sm text-slate-300">
          <p>
            Team admins can plan one job across multiple drones, assign pilots and visual observers,
            and sequence weather windows before crews roll out.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="font-semibold text-white">Free</p>
              <p className="mt-1">Location search and weather awareness only.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="font-semibold text-white">Pro</p>
              <p className="mt-1">Full solo-operator workflow, saved spots, checks, and logs.</p>
            </div>
            <div className="rounded-2xl border border-ped-orange/30 bg-ped-orange/10 px-3 py-3">
              <p className="font-semibold text-white">Team Admin</p>
              <p className="mt-1">Multi-aircraft mission planning, crew assignment, and team oversight.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Mission board">
        <div className="space-y-4 px-4 py-4">
          {TEAM_MISSIONS.map((mission) => (
            <div key={mission.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-white">{mission.title}</p>
                  <p className="text-sm text-slate-400">{mission.location}</p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(mission.status)}`}>
                  {mission.status} Window
                </span>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Flight window</p>
                  <p className="mt-1 text-sm font-medium text-white">{mission.window}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned drones</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mission.drones.map((drone) => (
                      <span key={drone} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300">
                        {drone}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Crew</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-300">
                    {mission.crew.map((member) => (
                      <li key={member}>{member}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageWrapper>
  );
}
