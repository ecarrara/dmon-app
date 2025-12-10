interface TrackingShellProps {
  children: React.ReactNode;
}

export function TrackingShell({ children }: TrackingShellProps) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-(--background-dark) text-white">
      {children}
    </div>
  );
}
