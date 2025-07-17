import { currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';

export const Hello = async () => {
  const t = await getTranslations('Dashboard');
  const user = await currentUser();

  return (
    <>
      <div className="mb-6">
        <p className="text-xl font-semibold mb-2">
          {`👋 `}
          {t('hello_message', { email: user?.primaryEmailAddress?.emailAddress ?? '' })}
        </p>
        <p className="text-gray-600">
          Ready to continue your aviation knowledge journey?
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">{t('continue_learning')}</h3>
          <p className="text-blue-700">Pick up where you left off in your studies</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-green-900">{t('bookmarks')}</h3>
          <p className="text-green-700">Access your saved regulations and procedures</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-purple-900">{t('progress')}</h3>
          <p className="text-purple-700">Track your learning achievements</p>
        </div>
      </div>
    </>
  );
};
