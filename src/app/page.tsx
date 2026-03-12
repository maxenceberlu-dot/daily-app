import TodoList from "@/components/TodoList";
import QuickNotes from "@/components/QuickNotes";
import WeatherWidget from "@/components/WeatherWidget";

export default function Home() {
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{greeting}</h1>
        <p className="text-[var(--muted)] mt-1 capitalize">{dateStr}</p>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Weather */}
        <div className="lg:col-span-1 space-y-6">
          <WeatherWidget />
        </div>

        {/* Middle column: Todo */}
        <div className="lg:col-span-1">
          <TodoList />
        </div>

        {/* Right column: Notes */}
        <div className="lg:col-span-1">
          <QuickNotes />
        </div>
      </div>
    </main>
  );
}

function getGreeting(hour: number): string {
  if (hour < 6) return "Bonne nuit";
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}
