import { Logo } from "./block/Logo";

export function EmptyProject() {
    return (
        <div className="flex h-[90vh] max-w-xl mx-auto items-center  justify-center p-4">
            <div className="flex flex-col text-center space-y-4 items-center">
                <Logo />
                <div className="text-center mb-4 max-w-sm text-muted-foreground">
                    <p>Get started by creating a new project or selecting a project from the project switcher above!</p>
                </div>
            </div>
        </div>
    );
}
