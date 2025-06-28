'use client';
import { Card } from '@/components/ui/card';
import { SettingsViewProps } from '@/types/dashboard.types';
import { trpc } from '@/trpc/react';
import { toast } from 'sonner';
import { ProjectMemberRoles } from '@/server/db/schema';
import { Resource } from '@/utils/permissions';

const resourceName = Resource.Settings;

export const SettingsView = ({
    project,
    members,
    currentUserRole,
}: SettingsViewProps & { currentUserRole: ProjectMemberRoles; }) => {
    const utils = trpc.useUtils();
    // const [isAddingMember, setIsAddingMember] = useState(false);
    // const [newMemberEmail, setNewMemberEmail] = useState('');
    // const [newMemberRole, setNewMemberRole] = useState<ProjectMemberRoles>('member');

    const onMutate = ({ message, success, data }: { message: string; success: boolean; data?: any; }) => {
        if (success) {
            toast.success(message);
            utils.project.getProjectMembersByProjectId.invalidate({ id: project?.id ?? '' });
        } else {
            toast.error(message);
        }
    }

    // const { mutate: updateRole } = trpc.project.updateProjectMemberRole.useMutation({
    //     onSuccess: (res) => onMutate({ message: 'Role updated successfully', success: res.success, data: null }),
    //     onError: (error) => onMutate({ message: error.message, success: false, data: null })
    // });

    // const { mutate: removeMember } = trpc.project.removeProjectMember.useMutation({
    //     onSuccess: (res) => onMutate({ message: 'Member removed successfully', success: res.success, data: null }),
    //     onError: (error) => onMutate({ message: error.message, success: false, data: null })
    // });

    return (
        <Card className="p-6 space-y-8">
            <div>
                <div>
                    <p className="font-semibold">{project?.name ?? 'Unnamed Project'}</p>
                    <p className="text-sm text-muted-foreground">{project?.description}</p>
                </div>
            </div>
        </Card>
    );
};
