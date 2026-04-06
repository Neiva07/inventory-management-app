export default function Loading() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    </main>
  );
}
