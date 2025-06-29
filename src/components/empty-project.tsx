import { Logo } from "./block/Logo";

export function EmptyProject() {
  return (
    <div className="mx-auto flex h-[90vh] max-w-xl items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Logo />
        <div className="mb-4 max-w-sm text-center text-muted-foreground">
          <p>
            Get started by creating a new project or selecting a project from
            the project switcher above!
          </p>
        </div>
      </div>
    </div>
  );
}
