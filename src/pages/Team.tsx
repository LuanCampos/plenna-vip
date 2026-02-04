/**
 * Team page - Manage team members.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { TeamMemberList } from '@/components/team/TeamMemberList';

export const Team = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t('team')}</h1>
        <p className="text-muted-foreground mt-1">{t('teamDescription')}</p>
      </div>

      {/* Team member list */}
      <TeamMemberList />
    </div>
  );
};
