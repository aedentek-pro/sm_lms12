
import React from 'react';

export const IconBase: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const { className, children, ...rest } = props;
  const combinedClassName = `shrink-0 transition-all duration-200 ease-in-out ${className || ''}`;
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      {...rest}
      className={combinedClassName.trim()}
    >
      {children}
    </svg>
  );
};


export const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-3.376-1.884a1.125 1.125 0 010-1.991l15.482-8.662a1.125 1.125 0 011.125 0l15.482 8.662a1.125 1.125 0 010 1.991l-3.376 1.884m-15.482 0l15.482 0" /></IconBase>
);
export const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);
export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);
export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></IconBase>
);
export const VideoCameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></IconBase>
);
export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.928A3 3 0 017.5 12.5m3 3.72a9.094 9.094 0 013.741-.479 3 3 0 01-4.682-2.72M12 12c-1.487 0-2.731.662-3.616 1.67a3.003 3.003 0 01-1.215-2.254M12 12c1.487 0 2.731.662 3.616 1.67a3.003 3.003 0 001.215-2.254M12 12a3 3 0 01-3-3m3 3a3 3 0 003-3m-3 3a3 3 0 01-3 3m3-3a3 3 0 003 3m0 0c1.11.278 2.03.834 2.741 1.52m-3.35-3.35a3 3 0 01-3.35 3.35m3.35-3.35a3 3 0 00-3.35 3.35m0 0c1.11-.278 2.03-.834 2.741 1.52m-4.682 4.682a3 3 0 01-4.682-2.72m-3.35 3.35a3 3 0 00-3.35-3.35m3.35 3.35a3 3 0 013.35-3.35m0 0c-1.11.278-2.03.834-2.741 1.52m4.682 4.682a3 3 0 014.682 2.72" /></IconBase>
);
export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663l.001.001zm-3.125-4.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></IconBase>
);
export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></IconBase>
);
export const ChatBubbleLeftRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.28c-1.131.084-2.18-.4-2.688-1.332a18.726 18.726 0 00-2.602-3.115c-.533-.46-1.197-.74-1.903-.74H8.25c-1.056 0-1.908-.853-1.908-1.908v-4.286c0-1.056.852-1.908 1.908-1.908h.384a18.726 18.726 0 012.602-3.115c.508-.932 1.557-1.416 2.688-1.332l3.722.28c1.131.085 1.98.957 1.98 2.097v3.192zM15.75 9.75a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z" /></IconBase>
);
export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);
export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.578 0c-.275.046-.55.097-.824.15l-2.122 5.292A2.25 2.25 0 004.58 12.358h14.84a2.25 2.25 0 002.13-2.316l-2.122-5.292a48.107 48.107 0 00-3.478-.397m-12.578 0c-.275.046-.55.097-.824.15M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></IconBase>
);
export const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></IconBase>
);
export const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></IconBase>
);
export const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></IconBase>
);
export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></IconBase>
);
export const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></IconBase>
);
export const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></IconBase>
);
export const ArrowRightOnRectangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></IconBase>
);
export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" /></IconBase>
);
export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></IconBase>
);
export const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32 1.011l-4.2 4.03a.563.563 0 00-.162.524l1.28 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.28-5.385a.563.563 0 00-.162-.524l-4.2-4.03a.563.563 0 01.32-1.011l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></IconBase>
);
export const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.49 21.41l4.68-1.23c1.44.8 3.09 1.24 4.87 1.24h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM12.04 20.13h-.01c-1.55 0-3.07-.4-4.42-1.15l-.32-.19-3.29.86.88-3.21-.21-.33c-.83-1.32-1.27-2.85-1.27-4.41 0-4.6 3.73-8.33 8.33-8.33 4.6 0 8.33 3.73 8.33 8.33s-3.73 8.33-8.33 8.33zm4.51-6.13c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.64-1.19-1.43-1.33-1.67-.14-.24-.01-.37.11-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4s.04-.28-.02-.4c-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.55-.42-.14-.01-.3 0-.46 0s-.42.06-.64.3c-.22.24-.86.84-.86 2.07s.88 2.4 1 2.56.02.02 1.73 2.66c2.14 1.63 2.53 1.52 3.2 1.52.48 0 1.1-.1 1.43-.64.33-.54.33-1 .27-1.12s-.25-.19-.5-.31z"/>
  </svg>
);
export const Cog6ToothIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5M12 9.75v.01M12 12v.01M12 14.25v.01M4.5 12a7.5 7.5 0 0115 0" /></IconBase>
);
export const PresentationChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></IconBase>
);
export const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></IconBase>
);
export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.186 2.25 2.25 0 00-3.933 2.186z" /></IconBase>
);
export const ArrowsPointingOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></IconBase>
);
export const ArrowsPointingInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L3.75 3.75M3.75 3.75v4.5m0-4.5h4.5m6.75 0L20.25 3.75m0 0v4.5m0-4.5h-4.5M9 15l-5.25 5.25m0 0v-4.5m0 4.5h4.5m6.75 0l5.25 5.25m0 0v-4.5m0 4.5h-4.5" /></IconBase>
);
export const ArrowDownTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></IconBase>
);
export const ClipboardDocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></IconBase>
);
export const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></IconBase>
);
export const Bars3Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></IconBase>
);
export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6zM12 12.75V18.75m0 0A3.75 3.75 0 0015.75 15v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V18.75m-3.75 0A3.75 3.75 0 0112 15v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v-1.5m0 0a3.75 3.75 0 00-3.75-3.75M12 11.25a3.75 3.75 0 013.75-3.75" /></IconBase>
);
export const MicrophoneSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12.75c.358-.323.674-.69.936-1.085m-1.58 3.822c-1.373.836-3.04 1.135-4.712.635-1.992-.573-3.6-2.224-3.88-4.296a6.002 6.002 0 015.203-6.524c.42-.083.849-.121 1.282-.121a6 6 0 015.82 5.132M12 11.25v2.516" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75l16.5 16.5" /></IconBase>
);
export const VideoCameraSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72 M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75l16.5 16.5" /></IconBase>
);
export const PhoneXMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25zm13.5 0l-3.75-3.75m0 0L12 6.75m3.75-3.75L12 3" /></IconBase>
);
export const ChatBubbleBottomCenterTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 14.25v.001M12 14.25v.001M14.25 14.25v.001M16.5 12a4.5 4.5 0 00-9 0" /></IconBase>
);
export const BanknotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></IconBase>
);
export const ChartPieIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></IconBase>
);
export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);
export const ComputerDesktopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></IconBase>
);

// Card Logos
export const MastercardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-mastercard" {...props}><title id="pi-mastercard">Mastercard</title><circle cx="15" cy="12" r="7" fill="#EB001B"></circle><circle cx="23" cy="12" r="7" fill="#F79E1B"></circle><path d="M22 12c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7 7-3.13 7-7z" fill="#FF5F00"></path></svg>
);
export const VisaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-visa" {...props}><title id="pi-visa">Visa</title><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#1A1F71"></path><path d="M14.4 16.1h-2.9l-2.3 6.3h2.9L13 18l.8-2.3h2.4l.2 2.3h2.9L14.4 16.1zm-1.6-1.9l.7-2.3.8 2.3h-1.5zM23.1 19.2l.5-2.9h-1.5l-.5 2.9h-2.8l1.6-9.1h3.1l1.6 9.1h-3zm-1-4.2l-.4-2.3-.4 2.3h.8zM31.1 16.1h-2.2l-1.6 9.1h2.9l.2-1.2h2.2l.3 1.2h2.9l-1.7-9.1h-2.8zm-1.2 5.5h-1.3l.5-2.9h1.3l-.5 2.9z" fill="#fff"></path></svg>
);
export const AmexIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-amex" {...props}><title id="pi-amex">American Express</title><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#0077C8"></path><path d="M11.6 8.9h2.3l2.2 2.9h-2.7l-1.1-1.5-1.1 1.5H8.7l2.9-4.1-2.9-4.1h2.7l1.1 1.5 1.1-1.5h2.7L11.6 8.9zm10.7 0h2.3l2.2 2.9h-2.7l-1.1-1.5-1.1 1.5h-2.6l2.9-4.1-2.9-4.1h2.7l1.1 1.5 1.1-1.5h2.7L22.3 8.9z" fill="#fff" /></svg>
);
export const DiscoverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-discover" {...props}><title id="pi-discover">Discover</title><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#FF6600"></path><path d="M12.4 12c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6zm9.3 0c0-1.8-1.5-3.3-3.3-3.3s-3.3 1.5-3.3 3.3 1.5 3.3 3.3 3.3 3.3-1.5 3.3-3.3z" fill="#fff"></path></svg>
);
